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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post, index) => (
                                <div 
                                    key={post.$id} 
                                    data-animate="scale-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
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
        </div>
    )
}

export default Home