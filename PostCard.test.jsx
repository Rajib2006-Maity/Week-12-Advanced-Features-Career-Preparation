import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PostCard from '../components/PostCard.jsx';

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { id: 'user-1', name: 'Ada' } })
}));

vi.mock('../api/api.js', () => ({
  default: {
    put: vi.fn().mockResolvedValue({ data: { liked: true, likesCount: 1 } }),
    post: vi.fn().mockResolvedValue({ data: { comments: [{ _id: 'c1', text: 'Nice!', author: { name: 'Bob' } }] } })
  }
}));

const samplePost = {
  _id: 'post-1',
  text: 'Hello, world!',
  mediaType: 'none',
  likes: [],
  comments: [],
  author: { name: 'Ada Lovelace', username: 'ada', avatarUrl: '' }
};

describe('PostCard', () => {
  test('renders post text and author name', () => {
    render(<PostCard post={samplePost} />);
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  test('toggles like count when the like button is clicked', async () => {
    render(<PostCard post={samplePost} />);
    const likeButton = screen.getByRole('button', { name: /🤍 0/ });

    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /❤️ 1/ })).toBeInTheDocument();
    });
  });

  test('submits a new comment', async () => {
    render(<PostCard post={samplePost} />);
    const input = screen.getByPlaceholderText(/write a comment/i);

    fireEvent.change(input, { target: { value: 'Nice!' } });
    fireEvent.click(screen.getByRole('button', { name: /post/i }));

    expect(await screen.findByText('Nice!')).toBeInTheDocument();
  });
});
