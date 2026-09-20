import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import { Star, MessageSquare, AlertCircle } from 'lucide-react';

const ReviewPanel = ({ workerId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewService.getWorkerReviews(workerId, user.token);
        setReviews(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    if (workerId && user?.token) fetchReviews();
  }, [workerId, user?.token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-6">Ratings & Reviews</h2>

      {error && (
        <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-secondary">{avgRating}</p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? 'fill-warning text-warning' : 'text-slate-300'}`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-slate-500">{star}</span>
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-warning rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No reviews yet.</p>
          <p className="text-sm mt-1">Reviews from customers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review._id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-secondary">{review.customerId?.fullName || 'Customer'}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-warning text-warning' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-slate-600">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewPanel;
