import React, {useEffect, useState, useMemo} from 'react'
import appwriteService from "../appwrite/config";
import {Container, PostCard} from '../components'
import { Link } from 'react-router-dom';
import { setupScrollAnimations } from '../utils/animations';
import { Query } from 'appwrite';
import authService from "../appwrite/auth";
import conf from "../conf/conf.js";

function Home() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalArticles, setTotalArticles] = useState(0)
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortOption, setSortOption] = useState('Newest')
    const categories = ['All', 'Destination', 'Culinary', 'Lifestyle', 'Tips & Hacks']

    useEffect(() => {
        setLoading(true)
        if (selectedCategory === 'All') {
            appwriteService.getPosts().then((posts) => {
                if (posts) {
                    const sortedPosts = sortPosts(posts.documents, sortOption);
                    setPosts(sortedPosts)
                }
                setLoading(false)
            })
        } else {
            appwriteService.getPosts([
                Query.equal("status", "active"),
                Query.equal("category", selectedCategory)
            ]).then((posts) => {
                if (posts) {
                    const sortedPosts = sortPosts(posts.documents, sortOption);
                    setPosts(sortedPosts)
                }
                setLoading(false)
            })
        }
    }, [selectedCategory, sortOption])
    
    // Function to sort posts based on the selected option
    const sortPosts = (posts, option) => {
        const postsToSort = [...posts]; // Create a copy to avoid mutating the original
        
        switch(option) {
            case 'Newest':
                return postsToSort.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
            case 'Oldest':
                return postsToSort.sort((a, b) => new Date(a.$createdAt) - new Date(b.$createdAt));
            case 'Most Popular':
                return postsToSort.sort((a, b) => (b.views || 0) - (a.views || 0));
            default:
                return postsToSort;
        }
    }
    
    // Fetch total number of articles
    useEffect(() => {
        const fetchTotalArticles = async () => {
            try {
                // Get all active posts
                const response = await appwriteService.getPosts([
                    Query.equal("status", "active")
                ]);
                
                if (response && response.documents) {
                    console.log(`Total articles found: ${response.total}`);
                    setTotalArticles(response.total);
                }
            } catch (error) {
                console.error("Error fetching total articles:", error);
                // Set a fallback value if fetch fails
                setTotalArticles(0);
            }
        };
        
        fetchTotalArticles();
    }, []);
    
    // Set up scroll animations when component mounts
    useEffect(() => {
        setupScrollAnimations();
        // Re-run when new content is loaded
        if (!loading) {
            setTimeout(() => {
                setupScrollAnimations();
            }, 100);
        }
    }, [loading]);

    // Get featured post data for hero section (most viewed post)
    const featuredPost = useMemo(() => {
      if (posts.length === 0) return null;
      
      // Sort posts by views (descending) and take the first one
      const sortedByViews = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0));
      return sortedByViews[0];
    }, [posts]);
    
    // Hero section background image logic
    const defaultHeroImage = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
    
    // Generate featured image URL if available
    const generateFeaturedImageUrl = () => {
        if (!featuredPost || !featuredPost.featuredImage) return defaultHeroImage;
        
        // Try to generate a direct URL from Appwrite
        try {
            return `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${featuredPost.featuredImage}/view?project=${conf.appwriteProjectId}`;
        } catch (error) {
            console.error("Error generating featured image URL:", error);
            return defaultHeroImage;
        }
    };
    
    const heroImageUrl = useMemo(() => {
        return generateFeaturedImageUrl();
    }, [featuredPost]);

    const featuredReadTime = featuredPost?.readTime || 10; // Use 10 as default if not available
    
    // Author data for featured post
    const [featuredAuthor, setFeaturedAuthor] = useState({
        name: 'Author',
        avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'%3E%3C/path%3E%3C/svg%3E"
    });
    
    // Profile images for users
    const profileImages = [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop", 
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
    ];
    
    // Fallback names for when user name is not available
    const fallbackNames = ["John Doe", "Jane Smith", "Alex Johnson", "Sam Wilson", "Taylor Swift", "Morgan Freeman", "Chris Evans", "Emma Watson", "Robert Downey"];
    
    // Fetch featured author details when featured post changes
    useEffect(() => {
        if (!featuredPost || !featuredPost.userId) return;
        
        const fetchFeaturedAuthor = async () => {
            try {
                // Check if current user matches the post userId
                const currentUser = await authService.getCurrentUser();
                const userId = featuredPost.userId;
                
                // Generate a consistent hash from the user's ID for deterministic avatar selection
                const userIdHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const avatarIndex = userIdHash % profileImages.length;
                
                if (currentUser && currentUser.$id === userId) {
                    // If it's the current user, use their actual name
                    const userName = currentUser.name || fallbackNames[avatarIndex];
                    
                    // Check if the user is Yash Singh Kuwarbi and use the specific image from public folder
                    if (userName === "Yash Singh Kuwarbi") {
                        setFeaturedAuthor({
                            name: userName,
                            avatar: "/WhatsApp Image 2025-07-21 at 15.07.29_ff90baa4.jpg"
                        });
                    } else {
                        setFeaturedAuthor({
                            name: userName,
                            avatar: profileImages[avatarIndex]
                        });
                    }
                } else {
                    // Use a deterministic approach for the name based on userId
                    const fallbackIndex = userIdHash % fallbackNames.length;
                    const userName = fallbackNames[fallbackIndex];
                    
                    // Check if the generated name is Yash Singh Kuwarbi
                    if (userName === "Yash Singh Kuwarbi") {
                        setFeaturedAuthor({
                            name: userName,
                            avatar: "/WhatsApp Image 2025-07-21 at 15.07.29_ff90baa4.jpg"
                        });
                    } else {
                        setFeaturedAuthor({
                            name: userName,
                            avatar: profileImages[avatarIndex]
                        });
                    }
                }
            } catch (error) {
                console.log("Error fetching featured author details:", error);
                // Use fallback in case of error
                const userId = featuredPost.userId;
                const userIdHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const avatarIndex = userIdHash % profileImages.length;
                const fallbackIndex = userIdHash % fallbackNames.length;
                
                setFeaturedAuthor({
                    name: fallbackNames[fallbackIndex],
                    avatar: profileImages[avatarIndex]
                });
            }
        };
        
        fetchFeaturedAuthor();
    }, [featuredPost]);

    return (
        <div className="w-full">
            {/* Hero Section - Full height with navbar overlay */}
            <section 
                className="relative min-h-screen bg-cover bg-center flex items-center"
                style={{ backgroundImage: `url(${heroImageUrl})` }}
                aria-label="Featured blog post"
            >
                {/* Dark gradient overlay (40-60% opacity) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60 to-transparent"></div>
                
                {/* Category Tag */}
                <div className="absolute top-24 left-8 md:left-12 z-10">
                    <span className="bg-secondary-white bg-opacity-80 text-primary-slate text-xs font-medium px-3 py-1 rounded-full">
                        {featuredPost?.category || "Destination"}
                    </span>
                </div>
                
                <div className="w-full absolute bottom-0 left-0 right-0">
                    <Container className="relative z-10 pb-16 md:pb-24">
                        <div className="max-w-2xl text-secondary-white">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in">
                                {featuredPost?.title || "Exploring the Wonders of Hiking"}
                            </h1>
                            <p className="text-base md:text-lg mb-6 text-secondary-lightGray opacity-90 animate-fade-in delay-200 max-w-xl">
                                {featuredPost ? 
                                    // Strip HTML tags and limit to ~120 characters with ellipsis
                                    featuredPost.content.replace(/<[^>]*>/g, '').substring(0, 120) + (featuredPost.content.length > 120 ? '...' : '') : 
                                    "An iconic landmark, this post unveils the secrets that make this destination a traveler's paradise."
                                }
                            </p>
                            
                            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-6 sm:items-center mb-8">
                                {/* Author and date info */}
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center">
                                        <img 
                                            src={featuredAuthor.avatar} 
                                            alt={featuredAuthor.name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-secondary-white"
                                            onError={(e) => {
                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'%3E%3C/path%3E%3C/svg%3E";
                                            }}
                                        />
                                        <span className="text-secondary-white font-medium ml-2">{featuredAuthor.name}</span>
                                    </div>
                                    <span className="text-secondary-mediumGray">•</span>
                                    <span className="text-secondary-mediumGray">
                                        {featuredPost ? new Date(featuredPost.$createdAt).toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : ''}
                                    </span>
                                    <span className="text-secondary-mediumGray">•</span>
                                    <span className="text-secondary-mediumGray">{featuredReadTime} mins read</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                                {/* Read More Button */}
                                {featuredPost && (
                                    <Link 
                                        to={`/post/${featuredPost.$id}`}
                                        className="inline-flex items-center px-6 py-3 bg-secondary-white text-primary-dark font-medium rounded-lg hover:bg-secondary-mediumGray transition-colors duration-300"
                                    >
                                        Read Full Article
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                )}
                                
                                {/* Views count badge - now next to the button */}
                                {featuredPost && (
                                    <div className="flex items-center space-x-2 mt-4 sm:mt-0 bg-secondary-white bg-opacity-20 px-3 py-1.5 rounded-full w-fit">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span className="text-secondary-white font-medium">
                                            {featuredPost.views || 0} {(featuredPost.views === 1) ? 'view' : 'views'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Pagination dots */}
                            <div className="flex space-x-3 mt-8">
                                <span className="w-2.5 h-2.5 rounded-full bg-secondary-white"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-secondary-white opacity-50"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-secondary-white opacity-50"></span>
                            </div>
                        </div>
                    </Container>
                </div>
            </section>

            {/* Blog Section */}
            <section className="py-16 bg-secondary-lightGray dark:bg-primary-dark">
                <Container>
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-primary-dark dark:text-secondary-white mb-4">
                            Blog
                        </h2>
                        <p className="text-lg text-secondary-darkGray dark:text-secondary-mediumGray">
                            Here, we share travel tips, destination guides, and stories that inspire your next adventure.
                        </p>
                    </div>
                    
                    {/* Category filters */}
                    <div className="flex flex-wrap items-center justify-between mb-8">
                        <div className="flex space-x-4 overflow-x-auto pb-2">
                            {categories.map((category) => (
                                <button 
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-md ${
                                        selectedCategory === category 
                                            ? 'bg-primary-dark text-secondary-white' 
                                            : 'hover:bg-secondary-mediumGray'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 md:mt-0">
                            <select 
                                className="px-4 py-2 bg-secondary-white dark:bg-primary-charcoal rounded-md border border-secondary-mediumGray"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="Newest">Newest</option>
                                <option value="Oldest">Oldest</option>
                                <option value="Most Popular">Most Popular</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-16">
                            <h2 className="text-3xl font-bold text-primary-dark dark:text-secondary-white mb-6" data-animate="fade-in">
                                {selectedCategory === 'All' 
                                    ? 'Welcome to Our Blog' 
                                    : `No Posts in ${selectedCategory} Category`}
                            </h2>
                            <p className="text-lg text-secondary-darkGray dark:text-secondary-mediumGray mb-8 max-w-2xl mx-auto" data-animate="slide-up">
                                {selectedCategory === 'All' 
                                    ? 'There are no posts yet. Be the first to share your story!' 
                                    : `There are no posts in the ${selectedCategory} category yet.`}
                            </p>
                            <Link 
                                to="/login" 
                                className="inline-flex items-center px-6 py-3 bg-accent-blue text-secondary-white font-semibold rounded-lg shadow-md hover:bg-accent-teal transition-colors duration-300"
                                data-animate="slide-up"
                            >
                                Create Your Blog
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post, index) => (
                                <div 
                                    key={post.$id} 
                                    data-animate="scale-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                    className="mb-4"
                                >
                                    <PostCard 
                                        $id={post.$id} 
                                        title={post.title} 
                                        featuredImage={post.featuredImage} 
                                        content={post.content} 
                                        $createdAt={post.$createdAt} 
                                        category={post.category} 
                                        userId={post.userId}
                                        readTime={post.readTime}
                                        views={post.views || 0}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {posts.length > 0 && (
                        <div className="mt-16 text-center" data-animate="fade-in">
                            <Link 
                                to="/all-posts" 
                                className="inline-flex items-center px-6 py-3 border border-accent-blue text-accent-blue dark:text-accent-blue font-semibold rounded-lg hover:bg-accent-blue hover:text-secondary-white transition-colors duration-300"
                            >
                                View All Posts
                            </Link>
                        </div>
                    )}
                </Container>
            </section>

            {/* Featured Experiences Section */}
            <section className="py-16 bg-white dark:bg-primary-charcoal">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Comfort Zone Card */}
                        <div className="relative h-[500px] rounded-lg overflow-hidden shadow-lg" data-animate="slide-up">
                            <div className="absolute inset-0 bg-primary-dark bg-opacity-80 z-10"></div>
                            <div className="absolute inset-0 flex flex-col justify-center p-10 z-20">
                                <div className="mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary-white bg-opacity-20 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-secondary-white mb-4">
                                    Explore more to get your comfort zone
                                </h2>
                                <p className="text-secondary-mediumGray mb-8">
                                    Book your perfect stay with us.
                                </p>
                                <div>
                                    <Link 
                                        to="/destinations" 
                                        className="inline-flex items-center px-6 py-3 bg-secondary-white text-primary-dark font-medium rounded-lg hover:bg-secondary-mediumGray transition-colors duration-300"
                                    >
                                        Booking Now
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Grid */}
                        <div className="grid grid-cols-1 grid-rows-2 gap-8 h-[500px]">
                            {/* Top Card - Article Available */}
                            <div className="relative rounded-lg overflow-hidden shadow-lg" data-animate="slide-up" style={{ animationDelay: '100ms' }}>
                                <img 
                                    src="https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
                                    alt="Mountain road with cyclist" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-70"></div>
                                <div className="absolute bottom-0 left-0 p-6">
                                    <p className="text-secondary-white font-medium mb-1">Article Available</p>
                                    <h3 className="text-4xl font-bold text-secondary-white">
                                        {loading ? (
                                            <div className="inline-block w-12 h-10">
                                                <div className="animate-pulse w-full h-full bg-secondary-white bg-opacity-30 rounded"></div>
                                            </div>
                                        ) : (
                                            totalArticles
                                        )}
                                    </h3>
                                </div>
                            </div>

                            {/* Bottom Card - Coastal View */}
                            <div className="relative rounded-lg overflow-hidden shadow-lg" data-animate="slide-up" style={{ animationDelay: '200ms' }}>
                                <img 
                                    src="https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                                    alt="Coastal cliffs" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-50"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <h3 className="text-2xl md:text-3xl font-bold text-secondary-white text-center max-w-xs">
                                        Beyond accommodation, creating memories of a lifetime
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    )
}

export default Home