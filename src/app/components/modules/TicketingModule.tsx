import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import {
  Ticket,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { getSupportSummary } from '../../../api/client';

export function TicketingModule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getSupportSummary({});
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Support API Error", err);
        setError("Données indisponibles");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error && !data) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Billetterie Support</h1>
          <p className="text-gray-600">Performance du support (HubSpot)</p>
        </div>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tickets ouverts</p>
                <h3 className="text-2xl">
                  {loading ? '...' : data?.open_tickets_count?.toLocaleString() ?? 0}
                </h3>
                {/* <p className="text-sm text-gray-600">+12 aujourd'hui</p> */}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tickets résolus</p>
                <h3 className="text-2xl">
                  {loading ? '...' : data?.resolved_tickets_count?.toLocaleString() ?? 0}
                </h3>
                {/* <p className="text-sm text-green-600">+18%</p> */}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Temps moy. résolution (h)</p>
                <h3 className="text-2xl">
                  {loading ? '...' : data?.avg_resolution_time_hours?.toFixed(1) ?? 0}
                </h3>
                {/* <p className="text-sm text-gray-600">Temps moy: 3.2h</p> */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
        <p>Les détails des tickets sont disponibles directement dans HubSpot.</p>
        <p className="text-sm mt-2">D'autres vues seront disponibles prochainement.</p>
      </div>
    </div>
  );
}
