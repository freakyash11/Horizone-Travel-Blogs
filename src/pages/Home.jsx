import React, {useEffect, useState, useMemo} from 'react'
import appwriteService from "../appwrite/config";
import {Container, PostCard} from '../components'
import { Link } from 'react-router-dom';
import { setupScrollAnimations } from '../utils/animations';
import { Query } from 'appwrite';
import authService from "../appwrite/auth";
import conf from "../conf/conf.js";

// Updated Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles properly
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
// Import required modules and register them
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import SwiperCore from 'swiper';

// Register Swiper modules
SwiperCore.use([Autoplay, Navigation, Pagination]);

function Home() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalArticles, setTotalArticles] = useState(0)
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortOption, setSortOption] = useState('Newest')
    const categories = ['All', 'Destination', 'Culinary', 'Lifestyle', 'Tips & Hacks']
    
    // Store both featured posts (most viewed and most liked)
    const [featuredPosts, setFeaturedPosts] = useState([])
    // Active slide index for the hero carousel
    const [activeSlideIndex, setActiveSlideIndex] = useState(0)
    
    useEffect(() => {
        setLoading(true)
        if (selectedCategory === 'All') {
            appwriteService.getPosts().then((posts) => {
                if (posts) {
                    const sortedPosts = sortPosts(posts.documents, sortOption);
                    setPosts(sortedPosts)
                    
                    // Get most viewed and most liked posts
                    const mostViewed = [...posts.documents].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
                    const mostLiked = [...posts.documents].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))[0];
                    
                    // Create featured posts array
                    const featured = [];
                    
                    // Add most viewed if exists
                    if (mostViewed) {
                        featured.push({
                            ...mostViewed,
                            featureType: 'Most Viewed'
                        });
                    }
                    
                    // Add most liked if exists and different from most viewed
                    if (mostLiked) {
                        if (!mostViewed || mostLiked.$id !== mostViewed.$id) {
                            featured.push({
                                ...mostLiked,
                                featureType: 'Most Liked'
                            });
                        } else {
                            // If the same post is both most viewed and liked, duplicate it with different labels
                            // This ensures we have at least 2 slides for Swiper to work properly
                            featured.push({
                                ...mostLiked,
                                $id: mostLiked.$id + '-liked',
                                featureType: 'Most Liked'
                            });
                        }
                    }
                    
                    console.log("Featured posts setup:", featured.length, featured.map(p => p.featureType));
                    
                    // Always ensure we have at least two slides for the carousel to work
                    if (featured.length === 1) {
                        featured.push({...featured[0], $id: featured[0].$id + '-copy'});
                    }
                    
                    setFeaturedPosts(featured);
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
      if (featuredPosts.length === 0) return null;
      return featuredPosts[activeSlideIndex] || featuredPosts[0];
    }, [featuredPosts, activeSlideIndex]);
    
    // Hero section background image logic
    const defaultHeroImage = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
    
    // Generate featured image URL if available
    const generateFeaturedImageUrl = (post) => {
        if (!post || !post.featuredImage) return defaultHeroImage;
        
        // Try to generate a direct URL from Appwrite
        try {
            return `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${post.featuredImage}/view?project=${conf.appwriteProjectId}`;
        } catch (error) {
            console.error("Error generating featured image URL:", error);
            return defaultHeroImage;
        }
    };

    const featuredReadTime = featuredPost?.readTime || 10; // Use 10 as default if not available
    
    // Author data for featured post
    const [featuredAuthor, setFeaturedAuthor] = useState({
        name: 'Author',
        avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'%3E%3C/path%3E%3C/svg%3E"
    });
    
    // Profile image configuration
    const authorConfig = {
        yashProfile: {
            name: "Yash Singh Kuwarbi",
            // Using proper path for deployment
            avatar: "/prof.jpg" // Make sure this image exists in your public folder
        },
        defaultImages: [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop", 
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
        ]
    };
    
    // Fallback names for when user name is not available
    const fallbackNames = ["John Doe", "Jane Smith", "Alex Johnson", "Sam Wilson", "Taylor Swift", "Morgan Freeman", "Chris Evans", "Emma Watson", "Robert Downey"];
    
    // Fetch featured author details when featured post changes
    useEffect(() => {
        if (!featuredPost || !featuredPost.userId) return;
        
        const fetchFeaturedAuthor = async () => {
            try {
                const userId = featuredPost.userId;
                
                // Generate a consistent hash from the user's ID for deterministic avatar selection
                const userIdHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const avatarIndex = userIdHash % authorConfig.defaultImages.length;
                
                // Try to get the user profile using the getUserProfile method
                const userProfile = await authService.getUserProfile(userId);
                console.log("Fetched user profile:", userProfile); // Add logging
                
                if (userProfile && userProfile.name) {
                    // If we found a user profile with a valid name
                    const userName = userProfile.name;
                    
                    // Check if the user is Yash Singh Kuwarbi
                    if (userName === authorConfig.yashProfile.name) {
                        setFeaturedAuthor({
                            name: userName,
                            avatar: authorConfig.yashProfile.avatar
                        });
                    } else {
                        setFeaturedAuthor({
                            name: userName,
                            avatar: authorConfig.defaultImages[avatarIndex]
                        });
                    }
                    return;
                }
                
                // Fallback: Check if current user matches the post userId
                const currentUser = await authService.getCurrentUser();
                
                if (currentUser && currentUser.$id === userId && currentUser.name) {
                    // If it's the current user and has a name, use their actual name
                    const userName = currentUser.name;
                    
                    // Check if the user is Yash Singh Kuwarbi
                    if (userName === authorConfig.yashProfile.name) {
                        setFeaturedAuthor({
                            name: userName,
                            avatar: authorConfig.yashProfile.avatar
                        });
                    } else {
                        setFeaturedAuthor({
                            name: userName,
                            avatar: authorConfig.defaultImages[avatarIndex]
                        });
                    }
                } else {
                    // Use a deterministic approach for the name based on userId
                    const fallbackIndex = userIdHash % fallbackNames.length;
                    const userName = fallbackNames[fallbackIndex];
                    
                    // Check if the generated name is Yash Singh Kuwarbi
                    if (userName === authorConfig.yashProfile.name) {
                        setFeaturedAuthor({
                            name: userName,
                            avatar: authorConfig.yashProfile.avatar
                        });
                    } else {
                        setFeaturedAuthor({
                            name: userName,
                            avatar: authorConfig.defaultImages[avatarIndex]
                        });
                    }
                }
            } catch (error) {
                console.log("Error fetching featured author details:", error);
                // Use fallback in case of error
                const userId = featuredPost.userId;
                const userIdHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const avatarIndex = userIdHash % authorConfig.defaultImages.length;
                const fallbackIndex = userIdHash % fallbackNames.length;
                
                // Ensure we're using the correct author configuration
                const userName = fallbackNames[fallbackIndex];
                if (userName === authorConfig.yashProfile.name) {
                    setFeaturedAuthor({
                        name: userName,
                        avatar: authorConfig.yashProfile.avatar
                    });
                } else {
                    setFeaturedAuthor({
                        name: userName,
                        avatar: authorConfig.defaultImages[avatarIndex]
                    });
                }
            }
        };
        
        fetchFeaturedAuthor();
    }, [featuredPost]);

    return (
        <div className="w-full">
            {/* Hero Section - Full height with navbar overlay */}
            <section 
                className="relative min-h-screen bg-cover bg-center flex items-center"
                aria-label="Featured blog posts"
            >
                <Swiper
                    modules={[Autoplay, Navigation, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    onSlideChange={(swiper) => {
                        console.log('Slide changed to:', swiper.activeIndex);
                        setActiveSlideIndex(swiper.activeIndex);
                    }}
                    onSwiper={(swiper) => {
                        console.log('Swiper instance:', swiper);
                    }}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                        el: '.swiper-pagination',
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    loop={true}
                    className="w-full h-full hero-swiper"
                >
                    {featuredPosts.length > 0 ? (
                        featuredPosts.map((post, index) => (
                            <SwiperSlide key={post.$id || index} className="w-full h-full">
                                <div 
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url(${generateFeaturedImageUrl(post)})` }}
                                >
                                    {/* Dark gradient overlay (40-60% opacity) */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60 to-transparent"></div>
                                    
                                    {/* Category Tag */}
                                    <div className="absolute top-24 left-8 md:left-12 z-10">
                                        <div className="flex items-center space-x-3">
                                            <span className="bg-secondary-white bg-opacity-80 text-primary-slate text-xs font-medium px-3 py-1 rounded-full">
                                                {post?.category || "Destination"}
                                            </span>
                                            <span className={`${
                                                post.featureType === 'Most Viewed' 
                                                    ? 'bg-blue-500' 
                                                    : 'bg-[#ef4444]'
                                            } bg-opacity-80 text-secondary-white text-xs font-medium px-3 py-1 rounded-full`}>
                                                {post.featureType}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full absolute bottom-0 left-0 right-0">
                                        <Container className="relative z-10 pb-16 md:pb-24">
                                            <div className="max-w-2xl text-secondary-white">
                                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in">
                                                    {post?.title || "Exploring the Wonders of Hiking"}
                                                </h1>
                                                <p className="text-base md:text-lg mb-6 text-secondary-lightGray opacity-90 animate-fade-in delay-200 max-w-xl">
                                                    {post ? 
                                                        // Strip HTML tags and limit to ~120 characters with ellipsis
                                                        post.content.replace(/<[^>]*>/g, '').substring(0, 120) + (post.content.length > 120 ? '...' : '') : 
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
                                                                    console.log("Avatar image failed to load:", featuredAuthor.avatar);
                                                                    // Try to use a default image based on the user's ID hash
                                                                    const userId = post?.userId;
                                                                    if (userId) {
                                                                        const userIdHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                                                        const avatarIndex = userIdHash % authorConfig.defaultImages.length;
                                                                        e.target.src = authorConfig.defaultImages[avatarIndex];
                                                                    } else {
                                                                        // If no userId, use the first default image
                                                                        e.target.src = authorConfig.defaultImages[0];
                                                                    }
                                                                }}
                                                            />
                                                            <span className="text-secondary-white font-medium ml-2">{featuredAuthor.name}</span>
                                                        </div>
                                                        <span className="text-secondary-mediumGray">•</span>
                                                        <span className="text-secondary-mediumGray">
                                                            {post ? new Date(post.$createdAt).toLocaleDateString('en-US', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            }) : ''}
                                                        </span>
                                                        <span className="text-secondary-mediumGray">•</span>
                                                        <span className="text-secondary-mediumGray">{post.readTime || 10} mins read</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                                                    {/* Read More Button */}
                                                    {post && (
                                                        <Link 
                                                            to={`/post/${post.$id}`}
                                                            className="inline-flex items-center px-6 py-3 bg-secondary-white text-primary-dark font-medium rounded-lg hover:bg-secondary-mediumGray transition-colors duration-300"
                                                        >
                                                            Read Full Article
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                            </svg>
                                                        </Link>
                                                    )}
                                                    
                                                    {/* Metrics badges */}
                                                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                                                        {/* Views count badge */}
                                                        <div className="flex items-center space-x-1 bg-secondary-white bg-opacity-20 px-3 py-1.5 rounded-full">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            <span className="text-secondary-white font-medium">
                                                                {post.views || 0}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Likes count badge */}
                                                        <div className="flex items-center space-x-1 bg-secondary-white bg-opacity-20 px-3 py-1.5 rounded-full">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                            <span className="text-secondary-white font-medium">
                                                                {post.likeCount || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Container>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))
                    ) : (
                        <SwiperSlide className="w-full h-full">
                            <div 
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${defaultHeroImage})` }}
                            >
                                {/* Default content when no posts */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60 to-transparent"></div>
                                <div className="w-full absolute bottom-0 left-0 right-0">
                                    <Container className="relative z-10 pb-16 md:pb-24">
                                        <div className="max-w-2xl text-secondary-white">
                                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in">
                                                Welcome to MegaBlog
                                            </h1>
                                            <p className="text-base md:text-lg mb-6 text-secondary-lightGray opacity-90 animate-fade-in delay-200 max-w-xl">
                                                Start your adventure by exploring our collection of travel stories, tips, and destination guides.
                                            </p>
                                        </div>
                                    </Container>
                                </div>
                            </div>
                        </SwiperSlide>
                    )}
                
                    {/* Add navigation buttons directly inside Swiper */}
                    <div className="swiper-button-prev !text-white !opacity-70 hover:!opacity-100"></div>
                    <div className="swiper-button-next !text-white !opacity-70 hover:!opacity-100"></div>
                    
                    {/* Add pagination directly inside Swiper */}
                    <div className="swiper-pagination"></div>
                </Swiper>
                
                {/* Remove the old navigation controls that used refs */}
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
                                View All Blogs
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
                            <img 
                                src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                                alt="Scenic mountain landscape" 
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/90 to-primary-dark/70 z-10"></div>
                            <div className="absolute inset-0 flex flex-col justify-center p-10 z-20">
                                <h2 className="text-3xl md:text-4xl font-bold text-secondary-white mb-4 text-shadow-lg">
                                    Ready to Share Your Journey?
                                </h2>
                                <p className="text-secondary-mediumGray mb-8">
                                    Your adventures deserve a spotlight! <b>Create your first blog post </b> and inspire a community of fellow travelers. What incredible story will you tell?
                                </p>
                                <div>
                                    <Link 
                                        to="/add-post" 
                                        className="group inline-flex items-center px-8 py-4 bg-secondary-white text-primary-dark font-semibold rounded-xl shadow-lg hover:bg-accent-blue hover:text-secondary-white transform hover:scale-105 transition-all duration-300 ease-in-out relative overflow-hidden"
                                    >
                                        <span className="relative z-10">Create Blog</span>
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300 ease-in-out" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M14 5l7 7m0 0l-7 7m7-7H3" 
                                            />
                                        </svg>
                                        <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-accent-teal opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Grid */}
                        <div className="grid grid-cols-1 grid-rows-2 gap-8 h-[500px]">
                            {/* Top Card - Article Available */}
                            <div className="relative rounded-lg overflow-hidden shadow-lg" data-animate="slide-up" style={{ animationDelay: '100ms' }}>
                                <img 
                                    src="../../Footer-Section-Image.jpg" 
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
                                    src="https://plus.unsplash.com/premium_photo-1718146019167-110481171ad2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
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
