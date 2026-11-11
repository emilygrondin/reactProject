import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import Price from './Price';

const Book = ({ book }) => {
    const [imageResult, setImageResult] = useState(null);
    const imageReady = imageResult && imageResult.url === book.url;

    useEffect(() => {
        const image = new Image();
        let timeout;
        image.onload = () => {
            timeout = setTimeout(() => {
                setImageResult({ url: book.url, failed: false });
            }, 300);
        };
        image.onerror = () => {
            setImageResult({ url: book.url, failed: true });
        };
        image.src = book.url;

        return () => {
            image.onload = null;
            image.onerror = null;
            clearTimeout(timeout);
        };
    }, [book.url]);
    return (
        <div className="book">
            {
                imageReady ? (
                <>
                    <Link to={`/books/${book.id}`}>
                        <div className="book__img--wrapper">
                            {imageResult.failed ? (
                                <span>Image unavailable</span>
                            ) : (
                                <img src={book.url} alt={book.title} className="book__img"/>
                            )}
                        </div>
                    </Link>
                    <div className="book__title">
                        <Link to={`/books/${book.id}`} className="book__title--link">{book.title}</Link>
                    </div>
                    <Rating rating={book.rating} />
                    <Price salePrice={book.salePrice} originalPrice={book.originalPrice} />
                </>
                ) : (
                <>
                    <div className="book__img--skeleton"></div>
                    <div className="skeleton book__title--skeleton"></div>
                    <div className="skeleton book__rating--skeleton"></div>
                    <div className="skeleton book__price--skeleton"></div>
                </>
                )
            }
    </div>
)}

export default Book;