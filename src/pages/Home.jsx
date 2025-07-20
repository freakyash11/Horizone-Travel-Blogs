import React, {useEffect, useState} from 'react'
import appwriteService from "../appwrite/config";
import {Container, PostCard} from '../components'
import { Link } from 'react-router-dom';
import { setupScrollAnimations } from '../utils/animations';
import { Query } from 'appwrite';

function Home() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('All')
    const categories = ['All', 'Destination', 'Culinary', 'Lifestyle', 'Tips & Hacks']

    useEffect(() => {
        setLoading(true)
        if (selectedCategory === 'All') {
            appwriteService.getPosts().then((posts) => {
                if (posts) {
                    setPosts(posts.documents)
                }
                setLoading(false)
            })
        } else {
            appwriteService.getPosts([
                Query.equal("status", "active"),
                Query.equal("category", selectedCategory)
            ]).then((posts) => {
                if (posts) {
                    setPosts(posts.documents)
                }
                setLoading(false)
            })
        }
    }, [selectedCategory])
    
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

    // Hero section background image - desert landscape with person sitting on cliff
    const heroImageUrl = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"

    return (
        <div className="w-full">
            {/* Hero Section - Full height with navbar overlay */}
            <section 
                className="relative min-h-screen bg-cover bg-center flex items-end"
                style={{ backgroundImage: `url(${heroImageUrl})` }}
                aria-label="Featured blog post"
            >
                {/* Dark gradient overlay (40-60% opacity) */}
                <div className="absolute inset-0 bg-gradient-to-t from-overlay-dark via-overlay-light to-transparent"></div>
                
                {/* Category Tag */}
                <div className="absolute top-32 left-8 md:left-16 z-10">
                    <span className="bg-secondary-white bg-opacity-80 text-primary-slate text-xs font-medium px-3 py-1 rounded-full">
                        Destination
                    </span>
                </div>
                
                <Container className="relative z-10 pb-24 md:pb-32">
                    <div className="max-w-2xl text-secondary-white">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 animate-fade-in">
                            Exploring the Wonders of Hiking
                        </h1>
                        <p className="text-lg md:text-xl mb-8 text-secondary-lightGray animate-fade-in delay-200">
                            An iconic landmark, this post unveils the secrets that make this destination a traveler's paradise.
                        </p>
                        
                        {/* Author and date info */}
                        <div className="flex items-center space-x-2 mb-6">
                            <img 
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                                alt="Theodore Reginald" 
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-secondary-white font-medium">Theodore Reginald</span>
                            <span className="text-secondary-mediumGray">•</span>
                            <span className="text-secondary-mediumGray">24 Jan 2024</span>
                            <span className="text-secondary-mediumGray">•</span>
                            <span className="text-secondary-mediumGray">10 mins read</span>
                        </div>
                        
                        {/* Pagination dots */}
                        <div className="flex space-x-2">
                            <span className="w-2 h-2 rounded-full bg-secondary-white"></span>
                            <span className="w-2 h-2 rounded-full bg-secondary-white opacity-50"></span>
                            <span className="w-2 h-2 rounded-full bg-secondary-white opacity-50"></span>
                        </div>
                    </div>
                </Container>
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
                            <select className="px-4 py-2 bg-secondary-white dark:bg-primary-charcoal rounded-md border border-secondary-mediumGray">
                                <option>Newest</option>
                                <option>Oldest</option>
                                <option>Most Popular</option>
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
                                    <PostCard {...post} />
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
                                    <h3 className="text-4xl font-bold text-secondary-white">78</h3>
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