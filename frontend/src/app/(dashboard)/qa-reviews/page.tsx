'use client';

import { useState } from 'react';
import { useQAReviews, useCreateQAReview, useUpdateQAReview } from '@/hooks/use-qa-reviews';
import { useTasks } from '@/hooks/use-tasks';
import { useUsers } from '@/hooks/use-users';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from '@/components/ui/dialog';
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/ui/table';
import { Plus, Pencil } from 'lucide-react';
import type { QAReview } from '@/types';

const STATUS_OPTIONS = [
 { label: 'All Statuses', value: 'all' },
 { label: 'Pending', value: 'PENDING' },
 { label: 'Approved', value: 'APPROVED' },
 { label: 'Rejected', value: 'REJECTED' },
 { label: 'Needs Changes', value: 'NEEDS_CHANGES' },
];

const statusVariant: Record<
 string,
 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
> = {
 PENDING: 'secondary',
 APPROVED: 'success',
 REJECTED: 'destructive',
 NEEDS_CHANGES: 'warning',
};

export default function QAReviewsPage() {
 const [page, setPage] = useState(1);
 const [statusFilter, setStatusFilter] = useState('all');
 const [createOpen, setCreateOpen] = useState(false);
 const [editOpen, setEditOpen] = useState(false);
 const [editingReview, setEditingReview] = useState<QAReview | null>(null);
 const limit = 10;

 const { data, isLoading, isError, error } = useQAReviews({
 page,
 limit,
 status: statusFilter !== 'all' ? statusFilter : undefined,
 });
 const createQAReview = useCreateQAReview();
 const updateQAReview = useUpdateQAReview();

 const { data: tasksData } = useTasks({ limit: 100 });
 const { data: usersData } = useUsers({ limit: 100 });

 const [createForm, setCreateForm] = useState({
 taskId: '',
 reviewerId: '',
 status: 'PENDING',
 score: '',
 comments: '',
 });

 const [editForm, setEditForm] = useState({
 status: 'PENDING',
 score: '',
 comments: '',
 });

 const handleCreate = async (e: React.FormEvent) => {
 e.preventDefault();
 await createQAReview.mutateAsync({
 taskId: createForm.taskId,
 reviewerId: createForm.reviewerId,
 status: createForm.status,
 score: createForm.score ? parseInt(createForm.score) : undefined,
 comments: createForm.comments || undefined,
 });
 setCreateForm({ taskId: '', reviewerId: '', status: 'PENDING', score: '', comments: '' });
 setCreateOpen(false);
 };

 const openEdit = (review: QAReview) => {
 setEditingReview(review);
 setEditForm({
 status: review.status,
 score: review.score?.toString() ?? '',
 comments: review.comments ?? '',
 });
 setEditOpen(true);
 };

 const handleEdit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!editingReview) return;
 await updateQAReview.mutateAsync({
 id: editingReview.id,
 status: editForm.status,
 score: editForm.score ? parseInt(editForm.score) : undefined,
 comments: editForm.comments || undefined,
 });
 setEditOpen(false);
 setEditingReview(null);
 };

 return (
 <div className="space-y-8">
 <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
 <div>
 <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-storm/55">
 quality
 </p>
 <h1 className="mt-2 text-[44px] font-medium leading-[1] tracking-[-0.025em] text-ink">
 qa reviews.
 </h1>
 <p className="mt-3 max-w-xl text-[16px] leading-[1.5] text-storm/75">
 Review task quality and provide feedback before delivery.
 </p>
 </div>
 <Dialog open={createOpen} onOpenChange={setCreateOpen}>
 <DialogTrigger asChild>
 <Button>
 <Plus className="mr-2 h-4 w-4" />
 Create Review
 </Button>
 </DialogTrigger>
 <DialogContent>
 <form onSubmit={handleCreate}>
 <DialogHeader>
 <DialogTitle>Create QA Review</DialogTitle>
 <DialogDescription>Submit a quality review for a task.</DialogDescription>
 </DialogHeader>
 <div className="grid gap-4 py-4">
 <div className="grid gap-2">
 <Label htmlFor="reviewTask">Task *</Label>
 <Select
 value={createForm.taskId}
 onValueChange={(v) => setCreateForm((p) => ({ ...p, taskId: v }))}
 >
 <SelectTrigger id="reviewTask">
 <SelectValue placeholder="Select task" />
 </SelectTrigger>
 <SelectContent>
 {tasksData?.data.map((task) => (
 <SelectItem key={task.id} value={task.id}>
 {task.title}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="grid gap-2">
 <Label htmlFor="reviewReviewer">Reviewer *</Label>
 <Select
 value={createForm.reviewerId}
 onValueChange={(v) => setCreateForm((p) => ({ ...p, reviewerId: v }))}
 >
 <SelectTrigger id="reviewReviewer">
 <SelectValue placeholder="Select reviewer" />
 </SelectTrigger>
 <SelectContent>
 {usersData?.data.map((u) => (
 <SelectItem key={u.id} value={u.id}>
 {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="grid gap-2">
 <Label htmlFor="reviewStatus">Status</Label>
 <Select
 value={createForm.status}
 onValueChange={(v) => setCreateForm((p) => ({ ...p, status: v }))}
 >
 <SelectTrigger id="reviewStatus">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="PENDING">Pending</SelectItem>
 <SelectItem value="APPROVED">Approved</SelectItem>
 <SelectItem value="REJECTED">Rejected</SelectItem>
 <SelectItem value="NEEDS_CHANGES">Needs Changes</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="grid gap-2">
 <Label htmlFor="reviewScore">Score (1–10)</Label>
 <Input
 id="reviewScore"
 type="number"
 min="1"
 max="10"
 value={createForm.score}
 onChange={(e) => setCreateForm((p) => ({ ...p, score: e.target.value }))}
 placeholder="Optional"
 />
 </div>
 </div>
 <div className="grid gap-2">
 <Label htmlFor="reviewComments">Comments</Label>
 <Textarea
 id="reviewComments"
 value={createForm.comments}
 onChange={(e) => setCreateForm((p) => ({ ...p, comments: e.target.value }))}
 placeholder="Feedback and notes..."
 rows={3}
 />
 </div>
 </div>
 <DialogFooter>
 <Button
 type="submit"
 disabled={
 createQAReview.isPending || !createForm.taskId || !createForm.reviewerId
 }
 >
 {createQAReview.isPending ? 'Creating...' : 'Create Review'}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 </div>

 {/* Edit Dialog */}
 <Dialog open={editOpen} onOpenChange={setEditOpen}>
 <DialogContent>
 <form onSubmit={handleEdit}>
 <DialogHeader>
 <DialogTitle>Update QA Review</DialogTitle>
 <DialogDescription>Update the status, score, and comments.</DialogDescription>
 </DialogHeader>
 <div className="grid gap-4 py-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="grid gap-2">
 <Label htmlFor="editStatus">Status</Label>
 <Select
 value={editForm.status}
 onValueChange={(v) => setEditForm((p) => ({ ...p, status: v }))}
 >
 <SelectTrigger id="editStatus">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="PENDING">Pending</SelectItem>
 <SelectItem value="APPROVED">Approved</SelectItem>
 <SelectItem value="REJECTED">Rejected</SelectItem>
 <SelectItem value="NEEDS_CHANGES">Needs Changes</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="grid gap-2">
 <Label htmlFor="editScore">Score (1–10)</Label>
 <Input
 id="editScore"
 type="number"
 min="1"
 max="10"
 value={editForm.score}
 onChange={(e) => setEditForm((p) => ({ ...p, score: e.target.value }))}
 placeholder="Optional"
 />
 </div>
 </div>
 <div className="grid gap-2">
 <Label htmlFor="editComments">Comments</Label>
 <Textarea
 id="editComments"
 value={editForm.comments}
 onChange={(e) => setEditForm((p) => ({ ...p, comments: e.target.value }))}
 placeholder="Feedback and notes..."
 rows={3}
 />
 </div>
 </div>
 <DialogFooter>
 <Button type="submit" disabled={updateQAReview.isPending}>
 {updateQAReview.isPending ? 'Updating...' : 'Update Review'}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>

 <div className="flex items-center gap-4">
 <Select
 value={statusFilter}
 onValueChange={(v) => {
 setStatusFilter(v);
 setPage(1);
 }}
 >
 <SelectTrigger className="w-[180px]">
 <SelectValue placeholder="Filter by status" />
 </SelectTrigger>
 <SelectContent>
 {STATUS_OPTIONS.map((opt) => (
 <SelectItem key={opt.value} value={opt.value}>
 {opt.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <span className="text-sm text-storm/70">
 {data ? `${data.meta.total} reviews` : 'Loading...'}
 </span>
 </div>

 <Card>
 <CardHeader className="sr-only">
 <CardTitle>QA Reviews Table</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead>Task</TableHead>
 <TableHead>Reviewer</TableHead>
 <TableHead>Status</TableHead>
 <TableHead>Score</TableHead>
 <TableHead>Comments</TableHead>
 <TableHead>Created</TableHead>
 <TableHead className="w-[80px]" />
 </TableRow>
 </TableHeader>
 <TableBody>
 {isLoading &&
 Array.from({ length: 5 }).map((_, i) => (
 <TableRow key={i}>
 {Array.from({ length: 7 }).map((_, j) => (
 <TableCell key={j}>
 <Skeleton className="h-4 w-20" />
 </TableCell>
 ))}
 </TableRow>
 ))}

 {isError && (
 <TableRow>
 <TableCell colSpan={7} className="text-center py-12 text-destructive">
 Failed to load QA reviews. {(error as Error)?.message || 'Unknown error'}
 </TableCell>
 </TableRow>
 )}

 {data?.data.map((review) => (
 <TableRow key={review.id}>
 <TableCell className="font-medium">
 {review.task?.title || review.taskId.slice(0, 8) + '...'}
 </TableCell>
 <TableCell className="text-storm/70">
 {review.reviewer
 ? [review.reviewer.firstName, review.reviewer.lastName]
 .filter(Boolean)
 .join(' ') || review.reviewer.email
 : '---'}
 </TableCell>
 <TableCell>
 <Badge variant={statusVariant[review.status] || 'secondary'}>
 {review.status.replace(/_/g, ' ')}
 </Badge>
 </TableCell>
 <TableCell className="text-storm/70">
 {review.score != null ? `${review.score}/10` : '---'}
 </TableCell>
 <TableCell className="text-storm/70 max-w-[250px] truncate">
 {review.comments || '---'}
 </TableCell>
 <TableCell className="text-storm/70">
 {new Date(review.createdAt).toLocaleDateString()}
 </TableCell>
 <TableCell>
 <Button variant="outline" size="sm" onClick={() => openEdit(review)}>
 <Pencil className="h-3 w-3" />
 </Button>
 </TableCell>
 </TableRow>
 ))}

 {data && data.data.length === 0 && (
 <TableRow>
 <TableCell colSpan={7} className="text-center py-12 text-storm/70">
 No QA reviews found.
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>

 {data && data.meta.totalPages > 1 && (
 <div className="border-t px-4 py-3 flex items-center justify-between">
 <p className="text-sm text-storm/70">
 Page {data.meta.page} of {data.meta.totalPages}
 </p>
 <div className="flex gap-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setPage((p) => Math.max(1, p - 1))}
 disabled={page <= 1}
 >
 Previous
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
 disabled={page >= data.meta.totalPages}
 >
 Next
 </Button>
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
