import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query } from "appwrite";
import { Permission, Role } from 'appwrite';

export class Service{
    client = new Client();
    databases;
    bucket;
    
    constructor(){
        this.client
        .setEndpoint(conf.appwriteUrl)
        .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    async createPost({title, slug, content, featuredImage, status, userId, category}){
        try {
            // Validate slug format before sending to Appwrite
            if (!this.isValidSlug(slug)) {
                throw new Error("Invalid slug format. Use only letters, numbers, and hyphens. Max 36 characters.");
            }
            
            // Store long content as a file if it's longer than 400 characters
            let contentId = null;
            let contentPreview = content;
            
            if (content && content.length > 400) {
                // Create a proper File object with the content
                const contentBlob = new Blob([content], { type: 'text/html' });
                const contentFile = new File([contentBlob], `${slug}-content.html`, { type: 'text/html' });
                const fileUpload = await this.uploadFile(contentFile);
                contentId = fileUpload.$id;
                
                // Store a preview of the content in the database
                contentPreview = content.substring(0, 397) + "...";
            }
            
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title,
                    content: contentPreview,
                    contentId,
                    featuredImage,
                    status,
                    userId,
                    category,
                }
            )
        } catch (error) {
            console.log("Appwrite service :: createPost :: error", error);
            throw error; // Re-throw to handle in the component
        }
    }

    // Helper method to validate slug format
    isValidSlug(slug) {
        // Check if slug is valid according to Appwrite requirements
        // Max 36 chars, valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore
        // Can't start with a special char
        const slugRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/;
        return slugRegex.test(slug);
    }

    async updatePost(slug, {title, content, featuredImage, status, category}){
        try {
            // Get the existing post to check if it has a contentId
            const existingPost = await this.getPost(slug);
            let contentId = existingPost.contentId || null;
            let contentPreview = content;
            
            // If content is longer than 400 characters
            if (content && content.length > 400) {
                // If there's already a content file, delete it
                if (contentId) {
                    try {
                        await this.deleteFile(contentId);
                    } catch (e) {
                        console.log("Failed to delete old content file, might be already deleted");
                    }
                }
                
                // Create a proper File object with the content
                const contentBlob = new Blob([content], { type: 'text/html' });
                const contentFile = new File([contentBlob], `${slug}-content.html`, { type: 'text/html' });
                const fileUpload = await this.uploadFile(contentFile);
                contentId = fileUpload.$id;
                
                // Store a preview of the content in the database
                contentPreview = content.substring(0, 397) + "...";
            } else {
                // If content is now short enough to store directly, delete any existing content file
                if (contentId) {
                    try {
                        await this.deleteFile(contentId);
                        contentId = null;
                    } catch (e) {
                        console.log("Failed to delete old content file, might be already deleted");
                    }
                }
            }
            
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title,
                    content: contentPreview,
                    contentId,
                    featuredImage,
                    status,
                    category,
                }
            )
        } catch (error) {
            console.log("Appwrite service :: updatePost :: error", error);
            throw error;
        }
    }

    async deletePost(slug){
        try {
            // Get the post to check if it has a contentId
            const post = await this.getPost(slug);
            
            // If the post has a contentId, delete the content file
            if (post.contentId) {
                try {
                    await this.deleteFile(post.contentId);
                } catch (e) {
                    console.log("Failed to delete content file, might be already deleted");
                }
            }
            
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            )
            return true
        } catch (error) {
            console.log("Appwrite service :: deletePost :: error", error);
            throw error;
        }
    }

    async getPost(slug){
        try {
            const post = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
            
            // If the post has a contentId, get the full content from the file
            if (post.contentId) {
                try {
                    // First try to get the file view directly (which works if permissions are set)
                    const fileUrl = this.getFileView(post.contentId);
                    const response = await fetch(fileUrl);
                    
                    if (response.ok) {
                        post.content = await response.text();
                    } else {
                        // If view fails, try download (requires authentication)
                        console.log("File view failed, trying download...");
                        const downloadUrl = this.getFileDownload(post.contentId);
                        const downloadResponse = await fetch(downloadUrl);
                        
                        if (downloadResponse.ok) {
                            post.content = await downloadResponse.text();
                        } else {
                            // If both fail, keep the preview content
                            console.log("Failed to access content file. Using preview content.");
                        }
                    }
                } catch (e) {
                    console.log("Failed to get content file:", e);
                }
            }
            
            return post;
        } catch (error) {
            console.log("Appwrite service :: getPost :: error", error);
            throw error;
        }
    }

    async getPosts(queries = [Query.equal("status", "active")]){
        try {
            const posts = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            );
            
            // No need to fetch content files here as we're only showing previews in listings
            return posts;
        } catch (error) {
            console.log("Appwrite service :: getPosts :: error", error);
            throw error;
        }
    }

    // Search posts by query string in title or content
    async searchPosts(searchQuery) {
        try {
            if (!searchQuery || searchQuery.trim() === '') {
                // If search query is empty, return all active posts
                return this.getPosts();
            }

            // Search in both title and content
            const titleQuery = [
                Query.equal("status", "active"),
                Query.search("title", searchQuery)
            ];
            
            const contentQuery = [
                Query.equal("status", "active"),
                Query.search("content", searchQuery)
            ];

            // Get posts that match title
            const titleResults = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                titleQuery
            );

            // Get posts that match content
            const contentResults = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                contentQuery
            );

            // Combine results and remove duplicates
            const allResults = [...titleResults.documents];
            
            // Add content results that aren't already in title results
            contentResults.documents.forEach(contentPost => {
                if (!allResults.some(post => post.$id === contentPost.$id)) {
                    allResults.push(contentPost);
                }
            });

            return {
                documents: allResults,
                total: allResults.length
            };
            
        } catch (error) {
            console.log("Appwrite service :: searchPosts :: error", error);
            throw error;
        }
    }

    // file upload service
    async uploadFile(file){
        try {
            console.log("Uploading file:", file.name || "unnamed file");
            
            // Upload without permissions first
            const fileUpload = await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file
            );
            
            // Then update permissions
            await this.bucket.updateFile(
                conf.appwriteBucketId,
                fileUpload.$id,
                undefined,
                [Permission.read(Role.any())]
            );
            
            return fileUpload;
        } catch (error) {
            console.log("Appwrite service :: uploadFile :: error", error);
            throw error;
        }
    }

    async deleteFile(fileId){
        try {
            await this.bucket.deleteFile(
                conf.appwriteBucketId,
                fileId
            )
            return true
        } catch (error) {
            console.log("Appwrite service :: deleteFile :: error", error);
            throw error;
        }
    }

    getFilePreview(fileId){
        if (!fileId) {
            console.error('getFilePreview called with null or undefined fileId');
            return '';
        }
        try {
            // Add width and height parameters for better image handling
            const url = this.bucket.getFilePreview(
                conf.appwriteBucketId,
                fileId,
                2000, // width
                2000, // height
                'center', // gravity
                100, // quality
                1, // border width
                'transparent', // border color
                0, // border radius
                1, // opacity
                0, // rotation
                'ffffff', // background color
                'webp', // output format - more efficient than default
            );
            console.log('Generated preview URL for file', fileId, ':', url.toString());
            
            // Log additional debugging info
            console.log('Appwrite config:', {
                endpoint: conf.appwriteUrl,
                projectId: conf.appwriteProjectId,
                bucketId: conf.appwriteBucketId
            });
            
            return url;
        } catch (error) {
            console.error('Error generating file preview URL:', error);
            
            // Fallback: try to construct the URL manually as a last resort
            try {
                // Try view endpoint first as it doesn't force download
                const fallbackUrl = `${conf.appwriteUrl}/v1/storage/buckets/${conf.appwriteBucketId}/files/${fileId}/view?project=${conf.appwriteProjectId}`;
                console.log('Using fallback view URL:', fallbackUrl);
                return fallbackUrl;
            } catch (e) {
                console.error('Even fallback URL generation failed:', e);
                return '';
            }
        }
    }
    
    getFileView(fileId){
        return this.bucket.getFileView(
            conf.appwriteBucketId,
            fileId
        )
    }
    
    getFileDownload(fileId){
        return this.bucket.getFileDownload(
            conf.appwriteBucketId,
            fileId
        )
    }
    
    // Method to fix permissions for existing files
    async updateFilePermissions(fileId) {
        try {
            if (!fileId) {
                throw new Error('updateFilePermissions called with null or undefined fileId');
            }
            
            console.log(`Updating permissions for file: ${fileId}`);
            
            const result = await this.bucket.updateFile(
                conf.appwriteBucketId,
                fileId,
                undefined, // name (keep existing)
                ['read("any")'] // Set public read permissions
            );
            
            console.log(`Successfully updated permissions for file: ${fileId}`);
            return result;
        } catch (error) {
            console.error(`Failed to update permissions for file ${fileId}:`, error);
            throw error;
        }
    }
    
    // Method to fix permissions for all files in the bucket
    async fixAllFilePermissions() {
        try {
            console.log("Starting permission update for all files in bucket");
            
            // Get list of all files in the bucket
            const filesList = await this.bucket.listFiles(conf.appwriteBucketId);
            
            if (!filesList || !filesList.files || filesList.files.length === 0) {
                console.log("No files found in bucket");
                return { success: true, message: "No files found to update", updatedCount: 0 };
            }
            
            console.log(`Found ${filesList.files.length} files to update`);
            
            // Update permissions for each file
            const updatePromises = filesList.files.map(file => 
                this.updateFilePermissions(file.$id)
                    .then(() => ({ fileId: file.$id, success: true }))
                    .catch(error => ({ fileId: file.$id, success: false, error }))
            );
            
            const results = await Promise.all(updatePromises);
            
            const successCount = results.filter(result => result.success).length;
            const failCount = results.length - successCount;
            
            console.log(`Permission update complete. Success: ${successCount}, Failed: ${failCount}`);
            
            return {
                success: true,
                message: `Updated permissions for ${successCount} files. Failed: ${failCount}`,
                updatedCount: successCount,
                failedCount: failCount,
                details: results
            };
        } catch (error) {
            console.error("Failed to update permissions for all files:", error);
            throw error;
        }
    }
}


const service = new Service()
export default service