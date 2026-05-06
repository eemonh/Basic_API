import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, RefreshCcw, Save, Send, User, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import JsonPlaceholderTable from '@/components/JsonPlaceholderTable';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isFetchingPosts, setIsFetchingPosts] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [editError, setEditError] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [posts]);

  const fetchPosts = async () => {
    setIsFetchingPosts(true);
    setFetchError('');

    try {
      const { data } = await api.get('/api/posts/getPosts');
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (error) {
      const message = error.response?.data?.message || 'Could not load posts. Please try again.';
      setFetchError(message);
      toast.error(message);
    } finally {
      setIsFetchingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      const message = 'Title and content are required.';
      setSubmitError(message);
      toast.error(message);
      return;
    }

    setIsCreatingPost(true);
    setSubmitError('');

    try {
      const { data } = await api.post('/api/posts/create', {
        title: trimmedTitle,
        content: trimmedContent,
      });

      setPosts((currentPosts) => [data.post, ...currentPosts]);
      setTitle('');
      setContent('');
      toast.success('Post created successfully.');
    } catch (error) {
      const message = error.response?.data?.message || 'Could not create post. Please try again.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const startEditingPost = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
    setEditError('');
  };

  const cancelEditingPost = () => {
    setEditingPostId(null);
    setEditTitle('');
    setEditContent('');
    setEditError('');
  };

  const handleUpdatePost = async (postId) => {
    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      const message = 'Title and content are required.';
      setEditError(message);
      toast.error(message);
      return;
    }

    setIsUpdatingPost(true);
    setEditError('');

    try {
      const { data } = await api.patch(`/api/posts/update/${postId}`, {
        title: trimmedTitle,
        content: trimmedContent,
      });

      setPosts((currentPosts) =>
        currentPosts.map((post) => (post._id === postId ? data.post : post))
      );
      cancelEditingPost();
      toast.success('Post updated successfully.');
    } catch (error) {
      const message = error.response?.data?.message || 'Could not update post. Please try again.';
      setEditError(message);
      toast.error(message);
    } finally {
      setIsUpdatingPost(false);
    }
  };

  const formatPostDate = (date) => {
    if (!date) return 'Just now';

    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="sticky top-0 z-10 border-b bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
              <span className="font-bold">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight">API Testing</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="font-medium">{user?.username}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950 dark:focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Welcome back, {user?.username}! Add a post or read what has been shared.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Create post</CardTitle>
              <CardDescription>Share a title and a short message with everyone.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="post-title" className="text-sm font-medium">
                    Title
                  </label>
                  <input
                    id="post-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title"
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                    disabled={isCreatingPost}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="post-content" className="text-sm font-medium">
                    Content
                  </label>
                  <textarea
                    id="post-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post..."
                    className="min-h-32 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                    disabled={isCreatingPost}
                    required
                  />
                </div>

                {submitError ? (
                  <p className="text-sm text-red-600 dark:text-red-500">{submitError}</p>
                ) : null}

                <Button type="submit" className="w-full" disabled={isCreatingPost}>
                  <Send className="h-4 w-4" />
                  {isCreatingPost ? 'Posting...' : 'Add post'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <CardTitle>All posts</CardTitle>
                <CardDescription>Newest posts appear first.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchPosts}
                disabled={isFetchingPosts}
              >
                <RefreshCcw className={isFetchingPosts ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isFetchingPosts ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Loading posts...
                </div>
              ) : fetchError ? (
                <div className="space-y-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                  <p>{fetchError}</p>
                  <Button type="button" variant="outline" size="sm" onClick={fetchPosts}>
                    Try again
                  </Button>
                </div>
              ) : sortedPosts.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No posts yet. Create the first one.
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedPosts.map((post) => (
                    <article
                      key={post._id}
                      className="rounded-md border bg-background p-4 dark:bg-zinc-950"
                    >
                      {editingPostId === post._id ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label htmlFor={`edit-title-${post._id}`} className="text-sm font-medium">
                              Title
                            </label>
                            <input
                              id={`edit-title-${post._id}`}
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                              disabled={isUpdatingPost}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor={`edit-content-${post._id}`} className="text-sm font-medium">
                              Content
                            </label>
                            <textarea
                              id={`edit-content-${post._id}`}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-28 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                              disabled={isUpdatingPost}
                              required
                            />
                          </div>

                          {editError ? (
                            <p className="text-sm text-red-600 dark:text-red-500">{editError}</p>
                          ) : null}

                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={cancelEditingPost}
                              disabled={isUpdatingPost}
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleUpdatePost(post._id)}
                              disabled={isUpdatingPost}
                            >
                              <Save className="h-4 w-4" />
                              {isUpdatingPost ? 'Saving...' : 'Save changes'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                              <h2 className="font-semibold leading-none">{post.title}</h2>
                              <time className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formatPostDate(post.updatedAt || post.createdAt)}
                              </time>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingPost(post)}
                              disabled={isUpdatingPost}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                            {post.content}
                          </p>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </CardContent>
           </Card>
         </div>

           <JsonPlaceholderTable />
       </main>
     </div>
   );
}
