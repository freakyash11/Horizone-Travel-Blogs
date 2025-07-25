import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import authService from "../appwrite/auth";
import { Button, Container, LikeButton } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import conf from "../conf/conf.js";

// Default placeholder avatar
const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'%3E%3C/path%3E%3C/svg%3E";

// Author Info Component
const AuthorInfo = ({ userId, createdAt, content, readTime, views = 0 }) => {
    const [author, setAuthor] = useState({
        name: "Author",
        avatar: defaultAvatar,
    });

    useEffect(() => {
        const fetchAuthorDetails = async () => {
            try {
                // Try to get the user profile using the new getUserProfile method
                const userProfile = await authService.getUserProfile(userId);
                
                if (userProfile && userProfile.name) {
                    // If we found a user profile, use the real name
                    setAuthor({
                        name: userProfile.name,
                        avatar: defaultAvatar, // You can add profile pictures to user profiles later
                    });
                    return;
                }
                
                // Fallback: Try to get user info if possible
                const currentUser = await authService.getCurrentUser();
                
                if (currentUser && currentUser.$id === userId) {
                    setAuthor({
                        name: currentUser.name,
                        avatar: defaultAvatar, // Use a proper avatar if available
                    });
                } else {
                    // For demo, use a placeholder
                    setAuthor({
                        name: "Author",
                        avatar: defaultAvatar,
                    });
                }
            } catch (error) {
                console.log("Error fetching author details:", error);
            }
        };
        
        if (userId) {
            fetchAuthorDetails();
        }
    }, [userId]);

    // Format date
    const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="flex items-center space-x-4">
            <img
                src={author.avatar}
                alt={author.name}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                    e.target.src = defaultAvatar;
                }}
            />
            <div>
                <p className="font-medium text-primary-dark dark:text-secondary-white">{author.name}</p>
                <div className="flex text-xs text-secondary-darkGray dark:text-secondary-mediumGray">
                    <span>{formattedDate}</span>
                    <span className="mx-1">•</span>
                    <span>{readTime || 5} min read</span>
                    <span className="mx-1">•</span>
                    <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {views} {views === 1 ? 'view' : 'views'}
                    </span>
                </div>
            </div>
        </div>
    );
};

function Post() {
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);
    const authStatus = useSelector((state) => state.auth.status);

    // Add state to track image loading status
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    
    // Create a map to track loading state for related post images
    const [relatedImagesState, setRelatedImagesState] = useState({});

    // Track if view count has been updated
    const viewCountUpdated = React.useRef(false);

    const isAuthor = post && userData ? post.userId === userData.$id : false;

    // Fetch post data
    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) {
                    setPost(post);
                    // After setting the post, fetch related posts by category
                    if (post.category) {
                        appwriteService
                            .getPosts([
                                // Query.equal("status", "active"),
                                // Query.equal("category", post.category),
                                // Query.notEqual("$id", slug), // Exclude current post
                            ])
                            .then((relatedPosts) => {
                                if (relatedPosts) {
                                    // Filter out the current post and limit to 3 related posts
                                    const filtered = relatedPosts.documents
                                        .filter((p) => p.$id !== slug)
                                        .slice(0, 3);
                                    
                                    // Initialize loading state for each related post
                                    const initialState = {};
                                    filtered.forEach(post => {
                                        initialState[post.$id] = {
                                            loading: true,
                                            error: false
                                        };
                                    });
                                    setRelatedImagesState(initialState);
                                    
                                    setRelatedPosts(filtered);
                                }
                            });
                    }
                }
            });
        }
    }, [slug, navigate]);

    // Increment view count when post is viewed
    useEffect(() => {
        // Only increment view count when post data is loaded
        if (post && slug) {
            // Only increment if not already counted in this component instance
            if (!viewCountUpdated.current) {
                // Increment the view count for this specific post
                appwriteService.incrementPostViews(slug, post.views);
                viewCountUpdated.current = true;
            }
        }
    }, [slug, post]);

    // Function to handle related image loading
    const handleRelatedImageLoad = (postId) => {
        setRelatedImagesState(prev => ({
            ...prev,
            [postId]: {
                ...prev[postId],
                loading: false
            }
        }));
    };

    // Function to handle related image error
    const handleRelatedImageError = (postId) => {
        setRelatedImagesState(prev => ({
            ...prev,
            [postId]: {
                ...prev[postId],
                error: true
            }
        }));
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this post?")) {
            appwriteService.deletePost(slug).then((status) => {
                if (status) {
                    navigate("/");
                }
            });
        }
    };

    // Format date for display
    const formattedDate = post?.$createdAt
        ? new Date(post.$createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : "";

    // Function to generate direct URL for an image
    const generateDirectImageUrl = (fileId) => {
        if (!fileId) return "";
        return `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${fileId}/view?project=${conf.appwriteProjectId}`;
    };

    // Function to get the correct image URL with fallbacks
    const getImageUrl = (fileId) => {
        if (!fileId) return "";
        
        // First try the direct URL
        try {
            return generateDirectImageUrl(fileId);
        } catch (error) {
            console.error("Error generating direct URL:", error);
            
            // Fallback to service preview
            try {
                return appwriteService.getFilePreview(fileId);
            } catch (error) {
                console.error("Error getting file preview:", error);
                return "";
            }
        }
    };

    return post ? (
        <div className="py-8 mt-12">
            <Container>
                <div className="max-w-4xl mx-auto">
                    {/* Featured Image */}
                    {post.featuredImage && (
                        <div className="mb-8 rounded-xl overflow-hidden relative">
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-secondary-lightGray dark:bg-primary-slate">
                                    <div className="animate-pulse text-accent-blue">Loading image...</div>
                                </div>
                            )}
                            <img
                                src={getImageUrl(post.featuredImage)}
                                alt={post.title}
                                className={`w-full h-auto object-cover ${imageError ? 'hidden' : ''}`}
                                onLoad={() => setImageLoading(false)}
                                onError={(e) => {
                                    setImageLoading(false);
                                    console.log("Primary image URL failed, trying fallback");
                                    
                                    // Try service URL as first fallback
                                    e.target.src = appwriteService.getFilePreview(post.featuredImage);
                                    
                                    // Add a second error handler for the fallback
                                    e.target.onerror = () => {
                                        console.log("Fallback also failed, using placeholder");
                                        setImageError(true);
                                        
                                        // Create a placeholder div instead
                                        const parent = e.target.parentNode;
                                        if (parent) {
                                            const placeholder = document.createElement('div');
                                            placeholder.className = 'w-full h-64 bg-secondary-mediumGray dark:bg-primary-slate flex items-center justify-center';
                                            placeholder.innerHTML = `
                                                <div class="text-center text-secondary-darkGray dark:text-secondary-mediumGray">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p>Image not available</p>
                                                </div>
                                            `;
                                            parent.appendChild(placeholder);
                                        }
                                    };
                                }}
                            />
                            {imageError && (
                                <div className="w-full h-64 bg-secondary-mediumGray dark:bg-primary-slate flex items-center justify-center">
                                    <div className="text-center text-secondary-darkGray dark:text-secondary-mediumGray">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p>Image not available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Category */}
                    {post.category && (
                        <div className="mb-4">
                            <span className="bg-secondary-mediumGray dark:bg-primary-slate text-primary-dark dark:text-secondary-white text-xs font-medium px-3 py-1 rounded-full">
                                {post.category}
                            </span>
                        </div>
                    )}

                    {/* Post Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <h1 className="text-4xl font-bold mb-6 text-primary-dark dark:text-secondary-white leading-tight">{post.title}</h1>
                        
                        {/* Post metadata with author, date, and now like button */}
                        <div className="flex flex-wrap items-center justify-between mb-6">
                            {/* Author info */}
                            <AuthorInfo 
                                userId={post.userId} 
                                createdAt={post.$createdAt} 
                                content={post.content} 
                                readTime={post.readTime} 
                                views={post.views || 0} 
                            />
                            
                            {/* Like button and edit/delete buttons */}
                            <div className="flex items-center space-x-4 mt-4 md:mt-0">
                                <LikeButton 
                                    postId={post.$id} 
                                    initialLikeCount={post.likeCount || 0} 
                                    className="text-lg"
                                />
                                
                                {/* Edit/Delete buttons for author */}
                                {authStatus && isAuthor && (
                                    <div className="flex space-x-2">
                                        <Link to={`/edit-post/${slug}`}>
                                            <Button bgColor="bg-accent-blue" className="mr-4">
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            bgColor="bg-red-500"
                                            onClick={handleDelete}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Post content */}
                        <div className="mt-8 text-primary-dark dark:text-secondary-white">
                            {parse(post.content || "")}
                        </div>
                    </div>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold mb-6 text-primary-dark dark:text-secondary-white">Related Posts</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedPosts.map((relatedPost) => (
                                    <Link
                                        key={relatedPost.$id}
                                        to={`/post/${relatedPost.$id}`}
                                        className="block"
                                    >
                                        <div className="bg-secondary-white dark:bg-primary-charcoal rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                            {/* Related post image */}
                                            {relatedPost.featuredImage && (
                                                <div className="aspect-[16/9] overflow-hidden">
                                                    <img
                                                        src={getImageUrl(relatedPost.featuredImage)}
                                                        alt={relatedPost.title}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            console.log("Related post image direct URL failed, trying service URL");
                                                            e.target.src = appwriteService.getFilePreview(relatedPost.featuredImage);
                                                            
                                                            // Add a second error handler for the fallback
                                                            e.target.onerror = () => {
                                                                console.log("Related post image fallback also failed");
                                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'%3E%3C/path%3E%3C/svg%3E";
                                                            };
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="p-4">
                                                {/* Related post category */}
                                                {relatedPost.category && (
                                                    <span className="text-xs font-medium text-secondary-darkGray dark:text-secondary-mediumGray">
                                                        {relatedPost.category}
                                                    </span>
                                                )}
                                                {/* Related post title */}
                                                <h3 className="text-lg font-bold mt-1 text-primary-dark dark:text-secondary-white line-clamp-2">
                                                    {relatedPost.title}
                                                </h3>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    ) : null;
}

export default Post;