import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCart } from '../../store/cartSlice';
import {
  getProductById,
  addToCart,
  getCart,
  getProductsByCategory,
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
} from '../../api/endpoints';
import { normalizeCartItems } from '../../utils/cartUtils';
import { ShoppingCart, Minus, Plus, ArrowLeft, Star, Truck, Shield, RotateCcw, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='150' y='150' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial,sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const isCustomerUser = () => {
    const role = String(user?.role || '').trim().toUpperCase();
    return role === 'CUSTOMER' || role === 'ROLE_CUSTOMER';
  };

  const getCartItemForProduct = () => {
    return cartItems.find(item => Number(item.product?.id) === Number(product?.id));
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await getProductById(id);
      const prod = response.data;
      setProduct(prod);
      setSelectedImage(prod.imageUrl || '');
      setQuantity(1);
      await fetchReviews(prod.id);

      // Fetch related products from same category
      if (prod.categoryId) {
        try {
          const relatedRes = await getProductsByCategory(prod.categoryId, 0, 12);
          setRelatedProducts(
            (relatedRes.data.content || []).filter(p => p.id !== prod.id).slice(0, 5)
          );
        } catch { /* ignore */ }
      }
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId = product?.id, qty = quantity) => {
    const normalizedProductId = Number(productId);
    const normalizedQty = Math.max(1, Number(qty || 1));

    if (!Number.isFinite(normalizedProductId) || normalizedProductId <= 0) {
      toast.error('Invalid product. Please refresh and try again.');
      return;
    }

    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!isCustomerUser()) {
      toast.error('Cart is available only for customer accounts');
      return;
    }

    setAddingToCartId(normalizedProductId);
    try {
      await addToCart({ productId: normalizedProductId, quantity: normalizedQty });
      const cartRes = await getCart();
      dispatch(setCart(normalizeCartItems(cartRes.data)));
      toast.success(`Added ${normalizedQty} item(s) to cart!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCartId(null);
    }
  };

  const getAllImages = () => {
    const imgs = [];
    if (product.imageUrl) imgs.push(product.imageUrl);
    if (product.images) {
      product.images.split(',').filter(u => u.trim()).forEach(u => imgs.push(u.trim()));
    }
    return imgs;
  };

  const discountedPrice = product
    ? product.price - (product.price * (product.discount || 0)) / 100
    : 0;

  const fetchReviews = async (productId) => {
    setReviewsLoading(true);
    try {
      const response = await getProductReviews(productId);
      const reviewList = Array.isArray(response.data) ? response.data : [];
      setReviews(reviewList);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setMyReview(null);
      setReviewForm({ rating: 5, comment: '' });
      return;
    }

    const mine = reviews.find((review) => Number(review.userId) === Number(user.id)) || null;
    setMyReview(mine);
    setReviewForm({
      rating: mine?.rating || 5,
      comment: mine?.comment || ''
    });
  }, [reviews, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to add a review');
      navigate('/login');
      return;
    }

    if (!isCustomerUser()) {
      toast.error('Only customer accounts can submit reviews');
      return;
    }

    setSubmittingReview(true);
    try {
      if (myReview?.id) {
        await updateReview(myReview.id, reviewForm);
        toast.success('Review updated successfully');
      } else {
        await createReview(id, reviewForm);
        toast.success('Review submitted successfully');
      }

      await Promise.all([fetchReviews(id), fetchProduct()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteMyReview = async () => {
    if (!myReview?.id) return;
    if (!window.confirm('Delete your review for this product?')) return;

    setDeletingReview(true);
    try {
      await deleteReview(myReview.id);
      toast.success('Review deleted');
      await Promise.all([fetchReviews(id), fetchProduct()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeletingReview(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner /></div>;
  if (!product) return null;

  const cartItemForProduct = getCartItemForProduct();
  const cartQuantityForProduct = Number(cartItemForProduct?.quantity || 0);
  const availableQuantity = Math.max(0, Number(product.stock || 0) - cartQuantityForProduct);
  const bookedCount = Number(product.bookingCount ?? 0);

  const images = getAllImages();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition"
          >
            <ArrowLeft size={20} />
            <span>Back to Products</span>
          </button>
        </div>

        {/* Product Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Images */}
            <div className="p-6 md:p-8">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                <img
                  src={selectedImage || PLACEHOLDER_IMG}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                />
                <div className="absolute top-3 left-3 bg-black/75 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Star size={12} className="fill-yellow-300 text-yellow-300" />
                  {(Number(product.rating || 0)).toFixed(1)}
                </div>
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                  {bookedCount > 0 && (
                    <span className="bg-blue-700/90 text-white text-xs px-2.5 py-1 rounded-full">
                      Booked {bookedCount}
                    </span>
                  )}
                  <span className="bg-green-700/90 text-white text-xs px-2.5 py-1 rounded-full">
                    Available {availableQuantity}
                  </span>
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === img ? 'border-green-600 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 md:p-8 flex flex-col">
              {/* Category */}
              {product.categoryName && (
                <span className="text-sm text-green-600 font-semibold uppercase tracking-wide mb-2">
                  {product.categoryName}
                </span>
              )}

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.round(product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.reviewCount || 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-green-600">${discountedPrice.toFixed(2)}</span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-bold">
                        -{product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description || 'No description available.'}</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {availableQuantity > 10 ? (
                  <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    In Stock ({availableQuantity} available)
                  </span>
                ) : availableQuantity > 0 ? (
                  <span className="inline-flex items-center gap-1 text-orange-600 font-semibold">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Low Stock - Only {availableQuantity} left!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              {(availableQuantity > 0 || cartItemForProduct) && (
                <div className="flex flex-col gap-4 mb-6">
                  {cartItemForProduct ? (
                    <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                      <p className="text-sm text-blue-700 font-semibold mb-3">
                        ✓ Already in your cart
                      </p>
                      <div className="text-sm text-gray-700 mb-3">
                        <p className="mb-1">Current quantity: <span className="font-bold">{cartItemForProduct.quantity}</span></p>
                        <p>Available stock: <span className="font-bold text-green-600">{availableQuantity}</span></p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleAddToCart(product.id, 1)}
                          disabled={addingToCartId === product.id || availableQuantity <= 0}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
                        >
                          {addingToCartId === product.id ? 'Adding...' : (availableQuantity <= 0 ? 'No Stock Left' : 'Add One More')}
                        </button>
                        <Link
                          to="/cart"
                          className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          View Cart
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-3 hover:bg-gray-100 transition"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="px-6 py-3 font-semibold text-lg border-x border-gray-300">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
                          className="px-4 py-3 hover:bg-gray-100 transition"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product.id, quantity)}
                        disabled={addingToCartId === product.id || availableQuantity <= 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition text-lg"
                      >
                        <ShoppingCart size={22} />
                        {addingToCartId === product.id ? 'Adding...' : (availableQuantity <= 0 ? 'No Stock' : 'Add to Cart')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mt-auto pt-6 border-t border-gray-200">
                <div className="flex flex-col items-center text-center gap-1">
                  <Truck size={20} className="text-green-600" />
                  <span className="text-xs text-gray-600">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <Shield size={20} className="text-green-600" />
                  <span className="text-xs text-gray-600">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <RotateCcw size={20} className="text-green-600" />
                  <span className="text-xs text-gray-600">30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews & Ratings</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl font-bold text-green-600">{(Number(product.rating || 0)).toFixed(1)}</div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{Number(product.reviewCount || 0)} reviews</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare size={16} />
              {myReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setReviewForm((prev) => ({ ...prev, rating: starValue }))}
                      className="p-1"
                    >
                      <Star
                        size={20}
                        className={starValue <= Number(reviewForm.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  maxLength={1000}
                  rows={4}
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Share your experience with this product"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                  {submittingReview ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review'}
                </button>
                {myReview && (
                  <button
                    type="button"
                    onClick={handleDeleteMyReview}
                    disabled={deletingReview}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {deletingReview ? 'Deleting...' : 'Delete Review'}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Reviews are allowed only for products from delivered orders.
              </p>
            </form>
          </div>

          <div className="space-y-4">
            {!reviewsLoading && reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{review.userName || 'Customer'}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Number(review.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(review.updatedAt || review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}

            {!reviewsLoading && reviews.length === 0 && (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500">
                No reviews yet. Be the first to rate this product after purchase.
              </div>
            )}

            {reviewsLoading && (
              <div className="text-sm text-gray-500">Loading reviews...</div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {relatedProducts.map((rp) => (
                <div
                  key={rp.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex-shrink-0 w-64"
                >
                  <Link to={`/products/${rp.id}`} className="group block">
                    <div className="aspect-square bg-gray-200 overflow-hidden">
                      <img
                        src={rp.imageUrl || PLACEHOLDER_IMG}
                        alt={rp.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${rp.id}`} className="block">
                      <h3 className="font-bold text-gray-900 truncate hover:text-green-600">{rp.name}</h3>
                    </Link>
                    <p className="text-green-600 font-bold text-lg mt-1">${rp.price}</p>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/products/${rp.id}`}
                        className="flex-1 text-center px-3 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleAddToCart(rp.id, 1)}
                        disabled={addingToCartId === rp.id || Number(rp.stock ?? 1) <= 0}
                        className={`flex-1 px-3 py-2 rounded-lg font-semibold transition text-sm ${
                          Number(rp.stock ?? 1) > 0
                            ? cartItems.find(item => Number(item.product?.id) === Number(rp.id))
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        } disabled:opacity-75`}
                      >
                        {addingToCartId === rp.id ? 'Adding...' : cartItems.find(item => Number(item.product?.id) === Number(rp.id)) ? '✓ In Cart' : Number(rp.stock ?? 1) > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
