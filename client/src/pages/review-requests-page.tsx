import { Helmet } from "react-helmet";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus } from "lucide-react";

export default function ReviewRequestsPage() {
  return (
    <div>
      <Helmet>
        <title>Review Requests | RepuRadar</title>
        <meta name="description" content="Manage your review requests and track customer feedback initiatives." />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Review Requests</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Review Requests</CardTitle>
            <CardDescription>
              Manage and track your review requests to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium">No requests found</h3>
              <p className="mt-2 text-sm text-slate-500">
                Get started by creating your first review request.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}