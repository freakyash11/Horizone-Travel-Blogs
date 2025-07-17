import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import conf from "../conf/conf";

export default function Post() {
    const [post, setPost] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [errorDetails, setErrorDetails] = useState('');
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.userId === userData.$id : false;

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) {
                    console.log("Post data loaded:", post);
                    console.log("Featured image ID:", post.featuredImage);
                    
                    // Generate image URL immediately when post is loaded
                    if (post.featuredImage) {
                        try {
                            const url = appwriteService.getFilePreview(post.featuredImage);
                            console.log("Image URL generated:", url.toString());
                            setImageUrl(url);
                        } catch (e) {
                            console.error("Failed to generate image URL:", e);
                            setImageError(true);
                            setErrorDetails("Failed to generate image URL: " + e.message);
                        }
                    }
                    
                    setPost(post);
                }
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

    const deletePost = () => {
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                appwriteService.deleteFile(post.featuredImage);
                navigate("/");
            }
        });
    };

    // Function to retry loading the image with a different approach
    const retryWithDirectUrl = () => {
        if (!post || !post.featuredImage) return;
        
        setImageLoading(true);
        setImageError(false);
        
        // Try direct URL construction
        const directUrl = `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${post.featuredImage}/view?project=${conf.appwriteProjectId}`;
        console.log("Trying direct URL:", directUrl);
        setImageUrl(directUrl);
    };

    return post ? (
        <div className="py-8">
            <Container>
                <div className="w-full mb-8 mt-16 overflow-hidden">
                    <div className="max-w-4xl mx-auto relative">
                        {imageLoading && post.featuredImage && !imageError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
                                <div className="animate-pulse text-gray-400">Loading image...</div>
                            </div>
                        )}
                        {post.featuredImage && !imageError ? (
                            <img
                                src={imageUrl}
                                alt={post.title}
                                className="w-full h-auto object-cover rounded-xl shadow-md border-2 border-gray-200"
                                style={{ maxHeight: "500px", minHeight: "300px" }}
                                onLoad={() => {
                                    console.log("Image loaded successfully");
                                    setImageLoading(false);
                                }}
                                onError={(e) => {
                                    console.error("Error loading image:", e);
                                    console.log("Failed URL:", imageUrl);
                                    setImageLoading(false);
                                    setImageError(true);
                                    setErrorDetails(`Failed to load image from ${imageUrl}`);
                                    
                                    // Try direct URL construction as last resort
                                    try {
                                        const fallbackUrl = `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${post.featuredImage}/preview?project=${conf.appwriteProjectId}`;
                                        console.log("Trying fallback URL:", fallbackUrl);
                                        e.target.src = fallbackUrl;
                                    } catch (err) {
                                        console.error("Fallback URL failed:", err);
                                        // Use a data URI as final fallback
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='400' y='200' font-family='Arial' font-size='32' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-full h-[300px] bg-gray-100 flex flex-col items-center justify-center rounded-xl">
                                <p className="text-gray-400 mb-4">{imageError ? "Failed to load image" : "No featured image available"}</p>
                                {imageError && (
                                    <>
                                        <p className="text-red-500 text-sm mb-4">{errorDetails}</p>
                                        <Button bgColor="bg-blue-500" onClick={retryWithDirectUrl}>
                                            Try Direct URL
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full mb-6 max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                        {post.category && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                {post.category}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                    {isAuthor && (
                        <div className="mb-6 flex flex-wrap">
                            <Link to={`/edit-post/${post.$id}`}>
                                <Button bgColor="bg-green-500" className="mr-3 mb-2">
                                    Edit
                                </Button>
                            </Link>
                            <Button bgColor="bg-red-500" onClick={deletePost} className="mr-3 mb-2">
                                Delete
                            </Button>
                            <Button 
                                bgColor="bg-purple-500" 
                                className="mr-3 mb-2"
                                onClick={() => {
                                    // Display diagnostic info for image loading issues
                                    console.log("--- IMAGE DIAGNOSTIC INFO ---");
                                    console.log("Post ID:", post.$id);
                                    console.log("Image ID:", post.featuredImage);
                                    console.log("Generated URL:", imageUrl);
                                    console.log("Appwrite Project:", conf.appwriteProjectId);
                                    console.log("Appwrite Bucket:", conf.appwriteBucketId);
                                    console.log("Appwrite URL:", conf.appwriteUrl);
                                    
                                    // Try to fetch the image directly to see response
                                    fetch(imageUrl)
                                        .then(response => {
                                            console.log("Direct fetch response:", response);
                                            return response.blob();
                                        })
                                        .then(blob => {
                                            console.log("Image blob:", blob);
                                        })
                                        .catch(error => {
                                            console.error("Direct fetch error:", error);
                                        });
                                    
                                    alert("Image diagnostic info logged to console");
                                }}
                            >
                                Diagnose Image
                            </Button>
                            {post.featuredImage && (
                                <Button 
                                    bgColor="bg-yellow-500" 
                                    className="mb-2 mr-3"
                                    onClick={() => {
                                        // Fix permissions for this specific file
                                        appwriteService.updateFilePermissions(post.featuredImage)
                                            .then(() => {
                                                alert("File permissions updated. Try reloading the image.");
                                                retryWithDirectUrl();
                                            })
                                            .catch(err => {
                                                console.error("Failed to update permissions:", err);
                                                alert("Failed to update permissions: " + err.message);
                                            });
                                    }}
                                >
                                    Fix This Image
                                </Button>
                            )}
                            
                            {isAuthor && (
                                <Button 
                                    bgColor="bg-orange-500" 
                                    className="mb-2"
                                    onClick={() => {
                                        if (confirm("This will update permissions for ALL files in the bucket. Continue?")) {
                                            // Fix permissions for all files in the bucket
                                            appwriteService.fixAllFilePermissions()
                                                .then((result) => {
                                                    alert(`Permission update complete.\n${result.message}`);
                                                    if (post.featuredImage) {
                                                        retryWithDirectUrl();
                                                    }
                                                })
                                                .catch(err => {
                                                    console.error("Failed to update all permissions:", err);
                                                    alert("Failed to update all permissions: " + err.message);
                                                });
                                        }
                                    }}
                                >
                                    Fix All Images
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <div className="browser-css prose prose-lg max-w-4xl mx-auto">
                    {parse(post.content)}
                </div>
            </Container>
        </div>
    ) : null;
}