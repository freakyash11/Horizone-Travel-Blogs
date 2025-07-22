import React, {useState, useEffect} from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";
import { Query } from 'appwrite';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import conf from "../conf/conf.js";
import { setupScrollAnimations } from '../utils/animations';

function MyPosts() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [debugInfo, setDebugInfo] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortOption, setSortOption] = useState('Newest')
    const categories = ['All', 'Destination', 'Culinary', 'Lifestyle', 'Tips & Hacks']
    const userData = useSelector((state) => state.auth.userData);
    const navigate = useNavigate();
    
    // Function to fetch all posts and filter client-side
    const fetchAllAndFilter = async () => {
        try {
            console.log("Fetching all posts and filtering client-side");
            
            // Get all active posts
            const response = await appwriteService.getPosts([
                Query.equal("status", "active"),
                Query.limit(100)
            ]);
            
            if (!response || !response.documents) {
                console.error("Invalid response format");
                return { success: false, error: "Invalid response format" };
            }
            
            // Filter by user ID
            let filtered = response.documents.filter(post => 
                post.userId === userData.$id
            );
            
            // Filter by category if needed
            if (selectedCategory !== 'All') {
                filtered = filtered.filter(post => 
                    post.category === selectedCategory
                );
            }
            
            console.log(`Found ${filtered.length} posts after client-side filtering`);
            return { 
                success: true, 
                posts: filtered,
                totalBefore: response.documents.length,
                totalAfter: filtered.length
            };
        } catch (err) {
            console.error("Error in client-side filtering:", err);
            return { success: false, error: err.message };
        }
    };
    
    // Debug function to check if posts are valid
    const validatePosts = (posts) => {
        if (!Array.isArray(posts)) {
            console.error("Posts is not an array:", posts);
            return false;
        }
        
        if (posts.length === 0) {
            console.log("Posts array is empty");
            return true; // Empty array is valid
        }
        
        // Check if posts have required properties
        const firstPost = posts[0];
        console.log("First post sample:", {
            id: firstPost.$id,
            title: firstPost.title,
            hasImage: !!firstPost.featuredImage,
            hasContent: !!firstPost.content,
            hasDate: !!firstPost.$createdAt,
            hasCategory: !!firstPost.category,
            hasUserId: !!firstPost.userId
        });
        
        return true;
    };
    
    useEffect(() => {
        // Check if user is authenticated
        if (!userData) {
            setLoading(false);
            setError("User not authenticated");
            return;
        }
        
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError(null);
                setDebugInfo(null);
                
                console.log("Fetching posts for user:", userData.$id);
                console.log("Current category filter:", selectedCategory);
                
                // Method 1: Try server-side filtering first
                try {
                    let queries = [
                        Query.equal("status", "active"),
                        Query.equal("userId", userData.$id)
                    ];
                    
                    if (selectedCategory !== 'All') {
                        queries.push(Query.equal("category", selectedCategory));
                    }
                    
                    console.log("Server-side query:", queries);
                    const response = await appwriteService.getPosts(queries);
                    
                    if (response && response.documents) {
                        console.log(`Found ${response.documents.length} posts with server-side filtering`);
                        
                        // Validate the posts data
                        validatePosts(response.documents);
                        
                        // Force a deep copy of the posts array to ensure reactivity
                        const postsCopy = JSON.parse(JSON.stringify(response.documents));
                        console.log("Setting posts state with:", postsCopy.length, "items");
                        
                        // Sort the posts based on the selected sort option
                        const sortedPosts = sortPosts(postsCopy, sortOption);
                        setPosts(sortedPosts);
                        setDebugInfo({
                            method: "server",
                            found: response.documents.length,
                            sample: response.documents.length > 0 ? {
                                id: response.documents[0].$id,
                                title: response.documents[0].title
                            } : null
                        });
                        setLoading(false);
                        return; // Exit if successful
                    }
                } catch (serverError) {
                    console.error("Server-side filtering failed:", serverError);
                    // Continue to client-side filtering
                }
                
                // Method 2: Fall back to client-side filtering
                const result = await fetchAllAndFilter();
                
                if (result.success) {
                    // Validate the posts data
                    validatePosts(result.posts);
                    
                    // Force a deep copy of the posts array
                    const postsCopy = JSON.parse(JSON.stringify(result.posts));
                    console.log("Setting posts state with (client-side):", postsCopy.length, "items");
                    
                    // Sort the posts based on the selected sort option
                    const sortedPosts = sortPosts(postsCopy, sortOption);
                    setPosts(sortedPosts);
                    setDebugInfo({
                        method: "client",
                        totalBefore: result.totalBefore,
                        found: result.totalAfter
                    });
                } else {
                    setError(`Failed to load posts: ${result.error}`);
                    setPosts([]);
                    setDebugInfo({ error: result.error });
                }
            } catch (err) {
                console.error("Error fetching posts:", err);
                setError(`Failed to load posts: ${err.message}`);
                setDebugInfo({ error: err.message });
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchPosts();
    }, [selectedCategory, userData, sortOption]);
    
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
    
    if (error && error === "User not authenticated") {
        return (
            <div className='w-full py-8 mt-12'>
                <Container>
                    <div className="text-center py-8">
                        <p className="text-lg">Please log in to view your posts.</p>
                        <button 
                            onClick={() => navigate("/login")}
                            className="mt-4 px-6 py-2 bg-[#3182ce] text-white rounded-md hover:bg-[#2c5282]"
                        >
                            Login
                        </button>
                    </div>
                </Container>
            </div>
        );
    }
    
    return (
        <div className='w-full py-16 bg-secondary-lightGray dark:bg-primary-dark'>
            <Container>
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-primary-dark dark:text-secondary-white mb-4">
                        My Posts
                    </h2>
                    <p className="text-lg text-secondary-darkGray dark:text-secondary-mediumGray">
                        Manage and view all your published blog posts.
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
                    <div className="flex items-center mt-4 md:mt-0 space-x-4">
                        <select 
                            className="px-4 py-2 bg-secondary-white dark:bg-primary-charcoal rounded-md border border-secondary-mediumGray"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="Newest">Newest</option>
                            <option value="Oldest">Oldest</option>
                            <option value="Most Popular">Most Popular</option>
                        </select>
                        
                        <button 
                            onClick={() => navigate("/add-post")}
                            className="px-4 py-2 bg-accent-teal text-secondary-white rounded-md hover:bg-accent-blue transition-colors duration-300 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            New Post
                        </button>
                    </div>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <div className="p-2 w-full text-red-500 mb-4">{error}</div>
                        <div className="flex justify-center space-x-4">
                            <button 
                                onClick={fetchAllAndFilter}
                                className="px-6 py-3 bg-accent-blue text-secondary-white font-semibold rounded-lg shadow-md hover:bg-accent-teal transition-colors duration-300"
                            >
                                Try Again
                            </button>
                            <button 
                                onClick={forceRefresh}
                                className="px-6 py-3 border border-accent-blue text-accent-blue font-semibold rounded-lg hover:bg-accent-blue hover:text-secondary-white transition-colors duration-300"
                            >
                                Force Refresh
                            </button>
                        </div>
                        {debugInfo && (
                            <div className="mt-8 p-4 bg-gray-100 text-left rounded-md max-w-lg mx-auto">
                                <pre className="text-xs overflow-auto">
                                    {JSON.stringify(debugInfo, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-16">
                        <h2 className="text-3xl font-bold text-primary-dark dark:text-secondary-white mb-6" data-animate="fade-in">
                            {selectedCategory === 'All' 
                                ? 'No Posts Yet' 
                                : `No Posts in ${selectedCategory} Category`}
                        </h2>
                        <p className="text-lg text-secondary-darkGray dark:text-secondary-mediumGray mb-8 max-w-2xl mx-auto" data-animate="slide-up">
                            {selectedCategory === 'All' 
                                ? 'You haven\'t created any posts yet. Start sharing your stories!' 
                                : `You don't have any posts in the ${selectedCategory} category yet.`}
                        </p>
                        <Link 
                            to="/add-post" 
                            className="inline-flex items-center px-6 py-3 bg-accent-blue text-secondary-white font-semibold rounded-lg shadow-md hover:bg-accent-teal transition-colors duration-300"
                            data-animate="slide-up"
                        >
                            Create Your First Post
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-secondary-darkGray dark:text-secondary-mediumGray mb-6">
                            Found {posts.length} posts {selectedCategory !== 'All' && `in ${selectedCategory} category`}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post, index) => (
                                <div 
                                    key={post.$id || index} 
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

export default MyPosts 