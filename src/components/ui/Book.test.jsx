import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Book from './Book';

jest.mock('./Rating', () => () => null);

const book = {
    id: 1,
    title: 'Test Book',
    url: 'https://example.com/book.jpg',
    originalPrice: 20,
    salePrice: 10,
    rating: 5,
};

let images;
let originalImage;

beforeEach(() => {
    jest.useFakeTimers();
    images = [];
    originalImage = global.Image;
    global.Image = class {
        constructor() {
            images.push(this);
        }
    };
});

afterEach(() => {
    global.Image = originalImage;
    jest.clearAllTimers();
    jest.useRealTimers();
});

function renderBook(currentBook = book) {
    return render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Book book={currentBook} />
        </MemoryRouter>
    );
}

test('shows the book after its image loads', () => {
    const { container } = renderBook();

    expect(container.querySelector('.book__img--skeleton')).not.toBeNull();
    expect(images[0].src).toBe(book.url);
    act(() => {
        images[0].onload();
        jest.advanceTimersByTime(300);
    });

    expect(screen.getByAltText(book.title).getAttribute('src')).toBe(book.url);
    expect(screen.getAllByRole('link', { name: book.title })).toHaveLength(2);
    expect(screen.getByText(book.title).getAttribute('href')).toBe('/books/1');
    expect(container.querySelector('.book__price').textContent).toContain('$10.00');
});

test('shows book details and an error when the image fails', () => {
    renderBook();

    act(() => images[0].onerror());

    expect(screen.getByText('Image unavailable')).toBeTruthy();
    expect(screen.getByRole('link', { name: book.title })).toBeTruthy();
});

test('loads a new image when the book URL changes and cleans up old handlers', () => {
    const { rerender, unmount } = renderBook();
    const firstImage = images[0];
    act(() => firstImage.onload());

    const updatedBook = { ...book, url: 'https://example.com/new.jpg' };
    rerender(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Book book={updatedBook} />
        </MemoryRouter>
    );

    expect(firstImage.onload).toBeNull();
    expect(firstImage.onerror).toBeNull();
    expect(images[1].src).toBe(updatedBook.url);
    act(() => jest.advanceTimersByTime(300));
    expect(screen.queryByAltText(book.title)).toBeNull();

    act(() => {
        images[1].onload();
        jest.advanceTimersByTime(300);
    });
    expect(screen.getByAltText(book.title).getAttribute('src')).toBe(updatedBook.url);

    unmount();
    expect(images[1].onload).toBeNull();
    expect(images[1].onerror).toBeNull();
});
