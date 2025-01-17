import * as commentRepository from '../model/comment.js';
import * as postRepository from '../model/post.js';

// 댓글 생성
export const createComment = async (req, res) => {
  const { content } = req.body;
  const userId = req.session?.user?.id;
  const postId = parseInt(req.params.post_id, 10);
  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }
  if (!postId || isNaN(postId)) {
    return res.status(400).json({ message: 'invalid post', data: null });
  }
  if (!content) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  try {
    const comment = {
      content,
      postId,
      userId,
    };

    const id = await commentRepository.create(comment);
    const created = await commentRepository.getById(id);
    const commentCount = await postRepository.countComment(postId);
    res.status(201).json({
      message: 'comment create success',
      data: { created, commentCount },
    });
  } catch (err) {
    console.error('댓글 생성 실패:', err);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 특정 게시글의 댓글 가져오기
export const getCommentsByPostId = async (req, res) => {
  const postId = parseInt(req.params.post_id);
  try {
    const comments = await commentRepository.getByPostId(postId);
    res.status(200).json({
      message: 'comments retrieve success',
      data: { comments },
    });
  } catch (err) {
    console.error('댓글 가져오기 실패:', err);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 댓글 수정
export const updateComment = async (req, res) => {
  const commentId = parseInt(req.params.comment_id, 10);
  const { content } = req.body;
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }
  if (!commentId || !content) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  try {
    const comment = await commentRepository.getById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'comment not found', data: null });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'no permission', data: null });
    }

    const updated = await commentRepository.update(content, commentId);

    res
      .status(200)
      .json({ message: 'comment update success', data: { comment: updated } });
  } catch (err) {
    console.error('댓글 수정 실패: ', err);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 댓글 삭제
export const deleteComment = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const commentId = parseInt(req.params.comment_id, 10);
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }
  if (!commentId) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  try {
    const found = await commentRepository.getById(commentId);
    if (!found) {
      return res.status(404).json({ message: 'comment not found', data: null });
    }
    if (found.userId !== userId) {
      return res.status(403).json({ message: 'no permission', data: null });
    }

    const commentCount = await commentRepository.remove(commentId, postId);
    res.status(204).send({ commentCount });
  } catch (err) {
    console.error('댓글 삭제 실패: ', err);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};
