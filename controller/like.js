import * as likeRepository from '../model/like.js';

// 좋아요 상태 확인
export const getLikeStatus = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;

  try {
    const likes = JSON.parse(fs.readFileSync(LIKE_FILE, 'utf-8'));
    const isLiked = likes.some((l) => l.postId == postId && l.userId == userId);

    res
      .status(200)
      .json({ message: 'like status retrieve success', data: { isLiked } });
  } catch (error) {
    console.error(`좋아요 상태 확인 실패: ${error}`);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 좋아요 추가/삭제
export const toggleLikePost = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;

  if (!postId) {
    return res.status(400).json({ message: 'invalid post', data: null });
  }
  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const posts = JSON.parse(fs.readFileSync(POST_FILE, 'utf-8'));
    const post = posts.find((p) => p.id == postId);

    if (!post) {
      return res.status(404).json({ message: 'post not found', data: null });
    }

    const likes = JSON.parse(fs.readFileSync(LIKE_FILE, 'utf-8'));
    const index = likes.findIndex(
      (l) => l.postId == postId && l.userId == userId
    );

    if (index !== -1) {
      // 좋아요 취소
      likes.splice(index, 1);
      fs.writeFileSync(LIKE_FILE, JSON.stringify(likes, null, 2));

      post.likeCount -= 1;
      fs.writeFileSync(POST_FILE, JSON.stringify(posts, null, 2));

      return res.status(200).json({
        message: 'like remove success',
        data: { isLiked: false, likeCount: post.likeCount },
      });
    } else {
      // 좋아요 추가
      const newLike = {
        id: likes.length + 1,
        userId,
        postId,
        createdAt: new Date().toISOString(),
      };

      likes.push(newLike);
      fs.writeFileSync(LIKE_FILE, JSON.stringify(likes, null, 2));

      post.likeCount += 1;
      fs.writeFileSync(POST_FILE, JSON.stringify(posts, null, 2));
      return res.status(200).json({
        message: 'like add success',
        data: { isLiked: true, likeCount: post.likeCount },
      });
    }
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};
