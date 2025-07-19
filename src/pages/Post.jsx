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
    const [forceUpdate, setForceUpdate] = useState(0);

    // Get authentication state from Redux
    const userData = useSelector((state) => state.auth.userData);
    const authStatus = useSelector((state) => state.auth.status);

    // Force a component update when auth state changes
    useEffect(() => {
        setForceUpdate(prev => prev + 1);
    }, [userData, authStatus]);

    // Function to generate direct URL for an image
    const generateDirectImageUrl = (fileId) => {
        if (!fileId) return '';
        return `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${fileId}/view?project=${conf.appwriteProjectId}`;
    };

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) {
                    // Generate image URL immediately when post is loaded
                    if (post.featuredImage) {
                        try {
                            // Try the direct URL approach first
                            const directUrl = generateDirectImageUrl(post.featuredImage);
                            setImageUrl(directUrl);
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
    }, [slug, navigate, forceUpdate]);

    // Determine if the current user is the author of the post
    const isAuthor = React.useMemo(() => {
        if (!post || !userData || !authStatus) return false;
        return post.userId === userData.$id;
    }, [post, userData, authStatus]);

    const deletePost = () => {
        appwriteService.deletePost(slug).then((status) => {
            if (status) {
                if (post.featuredImage) {
                    appwriteService.deleteFile(post.featuredImage);
                }
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
        const directUrl = generateDirectImageUrl(post.featuredImage);
        setImageUrl(directUrl);
    };

    // Function to try the Appwrite service URL as fallback
    const tryServiceUrl = () => {
        if (!post || !post.featuredImage) return;
        
        setImageLoading(true);
        setImageError(false);
        
        try {
            const serviceUrl = appwriteService.getFilePreview(post.featuredImage);
            setImageUrl(serviceUrl);
        } catch (e) {
            console.error("Failed to generate service URL:", e);
            setImageError(true);
            setErrorDetails("Failed to generate service URL: " + e.message);
        }
    };

    return post ? (
        <div className="py-8 font-['Inter,_system-ui,_-apple-system,_sans-serif']">
            <Container>
                {/* Hero Image Section */}
                <div className="w-full mb-8 mt-16 overflow-hidden">
                    <div className="max-w-5xl mx-auto relative">
                        {imageLoading && post.featuredImage && !imageError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                <div className="animate-pulse text-gray-400">Loading image...</div>
                            </div>
                        )}
                        {post.featuredImage && !imageError ? (
                            <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:shadow-xl">
                                <img
                                    src={imageUrl}
                                    alt={post.title}
                                    className="w-full h-auto object-cover"
                                    style={{ maxHeight: "600px", minHeight: "400px" }}
                                    onLoad={() => {
                                        setImageLoading(false);
                                    }}
                                    onError={(e) => {
                                        setImageLoading(false);
                                        setImageError(true);
                                        setErrorDetails(`Failed to load image from ${imageUrl}`);
                                        
                                        // Try service URL as fallback
                                        try {
                                            const fallbackUrl = appwriteService.getFilePreview(post.featuredImage);
                                            e.target.src = fallbackUrl;
                                        } catch (err) {
                                            // Use a data URI as final fallback
                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='400' y='200' font-family='Arial' font-size='32' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="w-full h-[400px] bg-[#f7fafc] flex flex-col items-center justify-center rounded-lg shadow-md">
                                <p className="text-[#718096] mb-4">{imageError ? "Failed to load image" : "No featured image available"}</p>
                                {imageError && (
                                    <>
                                        <p className="text-red-500 text-sm mb-4">{errorDetails}</p>
                                        <div className="flex space-x-4">
                                            <Button bgColor="bg-[#3182ce]" onClick={retryWithDirectUrl}>
                                                Try Direct URL
                                            </Button>
                                            <Button bgColor="bg-[#319795]" onClick={tryServiceUrl}>
                                                Try Service URL
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Post Content Section */}
                <div className="w-full mb-8 max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 mb-4">
                        {post.category && (
                            <span className="bg-[#e2e8f0] text-[#4a5568] text-xs font-medium px-3 py-1 rounded-full">
                                {post.category}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl font-bold mb-6 text-[#1a1a1a] leading-tight">{post.title}</h1>
                    
                    {/* Edit and Delete buttons */}
                    {authStatus && isAuthor && (
                        <div className="mb-8 flex flex-wrap">
                            <Link to={`/edit-post/${slug}`}>
                                <Button bgColor="bg-[#3182ce]" className="mr-4 mb-2">
                                    Edit
                                </Button>
                            </Link>
                            <Button bgColor="bg-[#2c2c2c]" onClick={deletePost} className="mr-4 mb-2">
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
                
                {/* Post Content */}
                <div className="browser-css prose prose-lg max-w-4xl mx-auto text-[#4a5568] leading-relaxed">
                    {parse(post.content)}
                </div>
            </Container>
        </div>
    ) : null;
}