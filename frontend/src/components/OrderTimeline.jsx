import React, { useState, useEffect } from 'react';
import { getOrderTimeline } from '../api/endpoints';
import { CheckCircle, Clock, TrendingUp, Package, Truck, MapPin } from 'lucide-react';

const OrderTimeline = ({ orderId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const response = await getOrderTimeline(orderId);
        setEvents(response.data);
      } catch (err) {
        console.error('Error fetching order timeline:', err);
        setError('Failed to load order timeline');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [orderId]);

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'ORDER_CREATED':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_PENDING':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'PAYMENT_FAILED':
      case 'PAYMENT_REFUNDING':
        return <Clock className="w-5 h-5 text-red-500" />;
      case 'PAYMENT_REFUNDED':
      case 'ORDER_CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PACKING':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'DELIVERED':
        return <MapPin className="w-5 h-5 text-green-500" />;
      case 'CANCELLED':
        return <Clock className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading timeline...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (events.length === 0) {
    return <div className="p-4 text-center text-gray-500">No events yet</div>;
  }

  return (
    <div className="timeline p-4 bg-white rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Order Timeline</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 to-green-200"></div>

        {/* Timeline events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={event.id} className="flex gap-4 relative">
              {/* Icon circle */}
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-200 relative z-10">
                {getEventIcon(event.eventType)}
              </div>

              {/* Content */}
              <div className="flex-grow mt-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{event.displayName}</h4>
                    {event.details && (
                      <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {new Date(event.createdAt).toLocaleDateString()} <br />
                    {new Date(event.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                
                {/* Status badge */}
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
