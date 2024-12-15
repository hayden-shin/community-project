import {
  readPostsFromFile,
  readCommentsFromFile,
  writePostsToFile,
} from '../models/postModel.js';

// 새 게시글 생성
export const createPost = async (req, res) => {
  const { title, text } = req.body;
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!title || !text) {
    return res.status(400).json({ message: 'invalid_request', data: null });
  }

  try {
    let imageUrl = req.file ? `/assets/${req.file.filename}` : null;

    const posts = await readPostsFromFile();

    // 새 게시글 생성
    const newPost = {
      post_id: posts.length + 1,
      title,
      text,
      image_url: imageUrl,
      author_id: user.id,
      author_profile_url: user.profile_image,
      author_nickname: user.nickname,
      created_at: new Date().toISOString(),
      likes: 0,
      views: 0,
      comments: 0,
      comment_ids: [],
      liked_users: [],
    };

    posts.push(newPost);
    writePostsToFile(posts);

    return res
      .status(201)
      .json({ message: 'post_created', data: { post_id: newPost.post_id } });
  } catch (error) {
    console.error('게시글 생성 실패:', error);
    return res
      .status(500)
      .json({ message: 'internal_server_error', data: null });
  }
};

// 특정 게시글 가져오기
export const getPostById = async (req, res) => {
  const postId = parseInt(req.params.post_id);
  console.log('Requested postId:', postId); // 요청된 post_id 로그

  try {
    const posts = await readPostsFromFile();
    console.log('All posts:', posts); // 로그용 - 전체 포스트

    const comments = await readCommentsFromFile();

    const post = posts.find((p) => p.post_id === postId);
    console.log('Found post:', post); // 로그용 - 특정 포스트

    if (!post) {
      return res.status(404).json({ message: 'post_not_found', data: null });
    }

    // 게시글의 댓글 로드
    const postComments = comments.filter((comment) =>
      post.comment_ids.includes(comment.comment_id)
    );

    // 조회수 증가
    post.views += 1;
    await writePostsToFile(posts);

    console.log('Returning data:', { ...post, comments: postComments });
    res.status(200).json({
      message: 'post_retrieved',
      data: { ...post, comments: postComments },
    });
  } catch (error) {
    console.error('게시글 가져오기 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 게시글 수정
export const editPost = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  console.log('수정 요청 게시글 ID: ', postId);

  const { title, text } = req.body;
  const imageUrl = req.file ? `/assets/${req.file.filename}` : null;
  console.log('수정 요청 데이터: ', title, text, imageUrl);

  try {
    // posts.json 파일에서 게시글 불러오기
    const posts = await readPostsFromFile();

    // 수정할 게시글 찾기
    const post = posts.find((p) => p.post_id === postId);
    console.log(post);

    if (!post) {
      return res.status(404).json({ message: 'post_not_found', data: null });
    }

    const user = req.session?.user; // 현재 로그인한 사용자 정보
    console.log('현재 로그인한 사용자: ', user);

    if (!user || post.author_id !== user.id) {
      return res.status(401).json({ message: 'no_permission', data: null });
    }

    post.title = title;
    post.text = text;
    if (imageUrl) post.image_url = imageUrl;

    if (title || text || imageUrl) {
      post.updated_at = new Date().toISOString();
    }

    console.log(`Post ID: ${postId}, Image: ${imageUrl}, Title: ${title}`);

    await writePostsToFile(posts);

    res.status(200).json({ message: 'post_updated', data: post });
  } catch (error) {
    console.log('댓글 수정 실패', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 모든 게시글 가져오기
export const getAllPosts = async (req, res) => {
  try {
    const posts = await readPostsFromFile();

    const sanitizedPosts = posts.map((post) => ({
      ...post,
      commentIds: post.commentIds || [],
    }));

    console.log('Retrieved posts:', posts); // 디버그 로그
    res.status(200).json({ message: 'posts_retrieved', data: posts });
  } catch (error) {
    console.error('게시글 목록 가져오기 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 게시글 삭제
export const deletePost = async (req, res) => {
  const postId = parseInt(req.params.post_id);
  const user = req.session?.user;

  console.log('삭제할 게시글 ID: ', postId);
  console.log('게시글 삭제를 요청한 사용자: ', req.session?.user?.id);

  if (!req.session.user) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const posts = await readPostsFromFile();

    const postIndex = posts.findIndex((p) => p.post_id == postId);
    console.log('post INDEX: ', postIndex);

    if (postIndex === -1) {
      return res.status(404).json({ message: 'post_not_found', data: null });
    }

    const post = posts[postIndex];
    if (post.author_id !== user.id) {
      return res.status(403).json({ message: 'no_permission', data: null });
    }

    posts.splice(postIndex, 1);
    await writePostsToFile(posts);

    res.status(204).send();
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

export const getLikeStatus = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;
  try {
    const posts = await readPostsFromFile();
    const post = posts.find((p) => p.post_id === postId);

    const isLiked = post.liked_users?.includes(userId) || false;

    res
      .status(200)
      .json({ message: 'Like status retrieved', data: { isLiked } });
  } catch (error) {
    console.log(`좋아요 상태 확인 실패: ${error}`);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};

export const toggleLikePost = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;

  if (!postId) {
    return res.status(400).json({ message: 'Invalid post ID', data: null });
  }
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized', data: null });
  }

  try {
    const posts = await readPostsFromFile();
    const post = posts.find((p) => p.post_id === postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found', data: null });
    }

    // 좋아요 상태 토글
    if (!Array.isArray(post.liked_users)) {
      post.liked_users = [];
    }

    const isLiked = post.liked_users.includes(userId);

    if (isLiked) {
      // 좋아요 취소
      post.liked_users = post.liked_users.filter((id) => id !== userId);
      post.likes -= 1;
    } else {
      // 좋아요 추가
      post.liked_users.push(userId);
      post.likes += 1;
    }

    await writePostsToFile(posts);

    res.status(200).json({
      message: 'like toggled',
      data: {
        likes: post.likes,
        isLiked: !isLiked, // 현재 좋아요 상태 반환
      },
    });
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};
