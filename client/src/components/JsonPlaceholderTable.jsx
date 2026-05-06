import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const PAGE_SIZE = 10;

export default function JsonPlaceholderTable() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['jsonPlaceholderPosts', currentPage],
    queryFn: async () => {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_page=${currentPage}&_limit=${PAGE_SIZE}`
      );
      const totalCount = Number(res.headers.get('x-total-count') || 100);
      const posts = await res.json();
      return { posts, totalCount };
    },
    staleTime: 5 * 60 * 1000,
  });

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;
  const posts = data?.posts || [];

  const columns = useMemo(
    () => [
      { header: 'ID', accessorKey: 'id', size: 60 },
      { header: 'User ID', accessorKey: 'userId', size: 80 },
      {
        header: 'Title',
        accessorKey: 'title',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      },
      {
        header: 'Body',
        accessorKey: 'body',
        cell: (info) => (
          <span className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
            {info.getValue()}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: posts,
    columns,
    manualPagination: true,
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>JSONPlaceholder Posts</CardTitle>
        <CardDescription>
          Server-side paginated posts from JSONPlaceholder (10 per page)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Loading posts...
          </div>
        ) : isError ? (
          <div className="space-y-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error.message || 'Failed to load posts from JSONPlaceholder'}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No posts found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b bg-zinc-50 dark:bg-zinc-800">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400"
                          style={{ width: header.getSize() }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Server-side Pagination Controls */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isPending}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                  if (page < 1 || page > totalPages) return null;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={isPending}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isPending}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
