import React, {useState, useEffect} from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";
import { Query } from 'appwrite';
import { setupScrollAnimations } from '../utils/animations';

function AllPosts() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortOption, setSortOption] = useState('Newest')
    const categories = ['All', 'Destination', 'Culinary', 'Lifestyle', 'Tips & Hacks']
    
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
    };
    
    useEffect(() => {
        setLoading(true);
        if (selectedCategory === 'All') {
            appwriteService.getPosts([Query.equal("status", "active")]).then((posts) => {
                if (posts) {
                    const sortedPosts = sortPosts(posts.documents, sortOption);
                    setPosts(sortedPosts);
                }
                setLoading(false);
            }).catch(error => {
                console.error("Error fetching posts:", error);
                setLoading(false);
            });
        } else {
            appwriteService.getPosts([
                Query.equal("status", "active"),
                Query.equal("category", selectedCategory)
            ]).then((posts) => {
                if (posts) {
                    const sortedPosts = sortPosts(posts.documents, sortOption);
                    setPosts(sortedPosts);
                }
                setLoading(false);
            }).catch(error => {
                console.error("Error fetching posts:", error);
                setLoading(false);
            });
        }
    }, [selectedCategory, sortOption])
    
    // Set up scroll animations when component mounts
    useEffect(() => {
        setupScrollAnimations();
        // Re-run when new content is loaded
        if (!loading) {
            setTimeout(() => {
                setupScrollAnimations();
            }, 100);
        }
    }, [loading, posts]);

    // Force re-render function
    const forceRefresh = () => {
        console.log("Forcing refresh...");
        // Create a temporary loading state to trigger re-render
        setLoading(true);
        
        // Wait a moment and then reset loading state
        setTimeout(() => {
            console.log("Current posts state:", posts);
            setLoading(false);
        }, 500);
    };
    
    return (
        <div className='w-full py-16 bg-secondary-lightGray dark:bg-primary-dark'>
            <Container>
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-primary-dark dark:text-secondary-white mb-4">
                        All Posts
                    </h2>
                    <p className="text-lg text-secondary-darkGray dark:text-secondary-mediumGray">
                        Discover a collection of travel stories, tips, and destination guides.
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
                                        ? 'bg-primary-dark text-secondary-white dark:bg-accent-blue' 
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
                                ? 'No Posts Found' 
                                : `No Posts in ${selectedCategory} Category`}
                        </h2>
                        <p className="text-lg text-secondary-darkGray dark:text-secondary-mediumGray mb-8 max-w-2xl mx-auto" data-animate="slide-up">
                            {selectedCategory === 'All' 
                                ? 'There are no posts available at the moment.' 
                                : `There are no posts in the ${selectedCategory} category yet.`}
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-secondary-darkGray dark:text-secondary-mediumGray mb-6">
                            Found {posts.length} posts {selectedCategory !== 'All' && `in ${selectedCategory} category`}
                        </p>
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
                        <div className="mt-16 text-center" data-animate="fade-in">
                            <button 
                                onClick={forceRefresh}
                                className="inline-flex items-center px-6 py-3 border border-accent-blue text-accent-blue dark:text-accent-blue font-semibold rounded-lg hover:bg-accent-blue hover:text-secondary-white transition-colors duration-300"
                            >
                                Refresh Posts
                            </button>
                        </div>
                    </>
                )}
            </Container>
        </div>
    )
}

export default AllPosts