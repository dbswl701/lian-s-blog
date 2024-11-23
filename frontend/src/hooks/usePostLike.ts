import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postLike } from 'apis/postLike';
import { toast } from 'react-toastify';

export const useLikePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			postId,
			isLiked,
		}: {
			postId: string;
			isLiked: boolean;
		}) => postLike(postId, isLiked),
		onMutate: async ({ postId, isLiked }) => {
			// 옵티미스틱 업데이트
			await queryClient.cancelQueries({ queryKey: ['post', postId] });

			const previousPost = queryClient.getQueryData<{
				likeCount: number;
				isLikedByUser: boolean;
			}>(['post', postId]);

			if (previousPost) {
				queryClient.setQueryData(['post', postId], {
					...previousPost,
					likeCount: previousPost.likeCount + (isLiked ? -1 : 1),
					isLikedByUser: !previousPost.isLikedByUser,
				});
			}

			return { previousPost };
		},
		onError: (error, { postId }, context) => {
			// 롤백
			if (context?.previousPost) {
				queryClient.setQueryData(
					['post', postId],
					context.previousPost
				);
			}

			toast.error(error.message, {
				position: 'top-right',
			});
		},
		onSettled: (data, error, { postId }) => {
			console.log('data', data);
			queryClient.invalidateQueries({ queryKey: ['post', postId] });
		},
	});
};