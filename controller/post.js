import * as postRepository from '../model/post.js';
import * as commentRepository from '../model/comment.js';

/*
TODO: rename variable userId -> userId for consistency
*/

// 새 게시글 생성
export const createPost = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }
  if (!title || !content) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  try {
    const imageUrl = req.file ? `/assets/${req.file.filename}` : null;
    const post = {
      title,
      content,
      imageUrl,
      userId: userId,
    };

    const id = await postRepository.create(post);
    return res.status(201).json({
      message: 'post create success',
      data: id,
    });
  } catch (err) {
    console.error('게시글 생성 실패:', err);
    return res
      .status(500)
      .json({ message: 'internal server error', data: null });
  }
};

// 특정 게시글 가져오기
export const getPost = async (req, res) => {
  const postId = parseInt(req.params.post_id);

  try {
    const post = await postRepository.getById(postId);
    if (!post) return res.sendStatus(404);

    // 댓글 가져오기
    const comments = await commentRepository.getByPostId(postId);

    res.status(200).json({
      message: 'post retrieve success',
      data: { post, comments },
    });
  } catch (error) {
    console.error('게시글 가져오기 실패: ', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 게시글 수정
export const editPost = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;
  const { title, content } = req.body;
  const imageUrl = req.file ? `/assets/${req.file.filename}` : null;

  try {
    const post = await postRepository.getById(postId);
    if (!post) return res.sendStatus(404);
    if (post.userId !== userId) {
      return res.status(401).json({ message: 'no permission', data: null });
    }

    const updated = await postRepository.update(
      title,
      content,
      imageUrl,
      postId
    );
    res.status(200).json({ message: 'post update success', data: updated });
  } catch (error) {
    console.log('게시글 수정 실패', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 모든 게시글 가져오기
export const getAllPosts = async (req, res) => {
  try {
    const posts = await postRepository.getAll();
    res.status(200).json({ message: 'posts retrieve success', data: posts });
  } catch (error) {
    console.error('게시글 목록 가져오기 실패: ', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 게시글 삭제
export const deletePost = async (req, res) => {
  const postId = parseInt(req.params.post_id);
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const post = await postRepository.getById(postId);
    if (!post) {
      return res.status(404).json({ message: 'post not found', data: null });
    }
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'no permission', data: null });
    }

    await postRepository.remove(postId);
    res.sendStatus(204);
  } catch (error) {
    console.error('게시글 삭제 실패: ', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};
