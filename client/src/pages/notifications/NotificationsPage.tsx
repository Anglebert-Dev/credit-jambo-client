import { useEffect, useState } from 'react';
import { Card } from '../../common/components/Card';
import { Button } from '../../common/components/Button';
import { Loader } from '../../common/components/Loader';
import { notificationsService } from '../../services/notifications.service';
import type { Notification } from '../../common/types/user.types';
import type { PaginatedResponse } from '../../common/types/api.types';
import { useUIStore } from '../../store/uiStore';

const PAGE_SIZE = 10;

const NotificationsPage = () => {
  const [items, setItems] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const { setUnreadNotifications } = useUIStore();

  const fetchNotifications = async (p: number) => {
    setIsLoading(true);
    try {
      const res: PaginatedResponse<Notification> = await notificationsService.getNotifications({ page: p, limit: PAGE_SIZE });
      setItems(res.data);
      setTotalPages(res.pagination.totalPages);
      const unread = res.data.filter((n) => !n.read).length;
      setUnreadNotifications(unread);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const markAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    fetchNotifications(page);
  };

  if (isLoading) {
    return <Loader fullScreen size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Notifications</h1>
      </div>

      <Card padding="md">
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No notifications</div>
        ) : (
          <ul className="divide-y">
            {items.map((n) => (
              <li key={n.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">{n.title}</p>
                  <p className="text-sm text-gray-600">{n.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <Button size="sm" variant="outline" onClick={() => markAsRead(n.id)}>
                      Mark as read
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;


