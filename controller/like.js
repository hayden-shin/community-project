// import { readLikesFromFile, writeLikesToFile } from '../models/likeModel.js';
// import { readPostsFromFile } from '../models/postModel.js';

// let isLiked = null;
// const postId = parseInt(req.params.post_id, 10);
// const userId = req.session?.user?.id;

// const getLikeStatus = async (req, res) => {
//   const postId = parseInt(req.params.post_id, 10);
//   const userId = req.session?.user?.id;
//   try {
//     const posts = await readPostsFromFile;
//     const post = posts.find((p) => p.post_id === postId);

//     const isLiked = post.liked_users?.includes(userId) || false;

//     res.status(200).json({ message: 'Like status retrieved', data: isLiked });
//   } catch (error) {
//     console.log(`좋아요 상태 확인 실패: ${error}`);
//     res.status(500).json({ message: 'Internal server error', data: null });
//   }
// };

// const addLike = async (req, res) => {
//   const likes = await readLikesFromFile();

//   const newLike = {
//     id: likes.length + 1,
//     user_id: userId,
//     post_id: postId,
//     comment_id: commentId,
//     created_at: new Date().toISOString(),
//   };

//   likes.push(newLike);
//   await writeLikesToFile(likes);

//   isLiked = true;

//   res.status(200).json({ message: 'Like added', data: isLiked });
// };

// const removeLike = (req, res) => {
//   const likes = readLikesFromFile();

//   likeIndex;

//   likes.splice(likeIndex, 1);
//   writeLikesToFile(likes);
// };
