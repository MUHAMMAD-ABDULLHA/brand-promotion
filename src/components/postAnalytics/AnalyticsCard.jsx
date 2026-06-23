


import React from "react";
import { Card, CardContent } from "../ui/card";
import { 
  Eye, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Users, 
  UserCheck, 
  MousePointerClick, 
  BarChart3, 
  FileText,
  Activity 
} from "lucide-react";

const iconMap = {
  // Existing types
  impression: <Eye className="w-6 h-6" />,
  like: <ThumbsUp className="w-6 h-6" />,
  comment: <MessageSquare className="w-6 h-6" />,
  share: <Share2 className="w-6 h-6" />,
  
  // New Requested types
  followers: <Users className="w-6 h-6" />,
  following: <UserCheck className="w-6 h-6" />,
  clicks: <MousePointerClick className="w-6 h-6" />,
  engagements: <Activity className="w-6 h-6" />, // Activity matches "Engagements" well
  posts: <FileText className="w-6 h-6" />,
  
  // Fallback
  default: <BarChart3 className="w-6 h-6" />
};

const AnalyticsCard = ({ title, value, type }) => {
  // Default to 'default' icon if type doesn't exist
  const icon = iconMap[type] || iconMap.default;

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 group cursor-default">
      <CardContent className="p-5 flex items-center gap-4">
        {/* Icon Container: Soft secondary background by default, Primary on hover */}
        <div className="p-3 rounded-lg bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
          {icon}
        </div>
        
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold text-foreground mt-0.5">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;