// import React, { useEffect } from "react";
// import UserGamificationCard from "./UserGamificationCard";
// import BrandGamificationCard from "./BrandGamificationCard";

// const GamificationList = ({ gamification, user }) => {
//   console.log(gamification)
//   // Log when the component mounts and receives new props
//   useEffect(() => {
//     console.log("GamificationList received props:", { gamification, user });
//     console.log("User role:", user?.user?.role);
//     console.log("Number of gamification items:", gamification ? gamification.length : 0);
//   }, [gamification, user]); // Dependency array ensures it runs when these props change

//   if (!gamification || gamification.length === 0) {
//     console.log("GamificationList: No data available, showing empty state.");
//     return (
//       <div className="text-center text-gray-400 py-8">
//         No gamification data available
//       </div>
//     );
//   }

//   const userRole = user?.user?.role;
//   console.log("GamificationList: Rendering list with items for role:", userRole);

//   return (
//     <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//       {gamification.map((item) => {
//         if (userRole === "endUser") {
//           console.log(`GamificationList: Rendering UserGamificationCard for item ID ${item.id}`);
//           return <UserGamificationCard key={item.id} item={item} />;
//         } else if (userRole === "brandAdmin") {
//           console.log(`GamificationList: Rendering BrandGamificationCard for item ID ${item.id}`);
//           return <BrandGamificationCard key={item.id} item={item} />;
//         } else {
//           console.log(`GamificationList: Item ID ${item.id} skipped due to unknown/missing role.`);
//           return null;
//         }
//       })}
//     </div>
//   );
// };

// export default GamificationList;


// import React, { useEffect } from "react";
// import UserGamificationCard from "./UserGamificationCard";
// import BrandGamificationCard from "./BrandGamificationCard";

// // NOTE: Added onEdit and onDelete to the prop destructuring
// const GamificationList = ({ gamification, user, onEdit, onDelete }) => {
//   console.log(gamification)
//   // Log when the component mounts and receives new props
//   useEffect(() => {
//     console.log("GamificationList received props:", { gamification, user });
//     console.log("User role:", user?.user?.role);
//     console.log("Number of gamification items:", gamification ? gamification.length : 0);
//   }, [gamification, user]); // Dependency array ensures it runs when these props change

//   if (!gamification || gamification.length === 0) {
//     console.log("GamificationList: No data available, showing empty state.");
//     return (
//       <div className="text-center text-gray-400 py-8">
//         No gamification data available
//       </div>
//     );
//   }

//   const userRole = user?.user?.role;
//   console.log("GamificationList: Rendering list with items for role:", userRole);

//   return (
//     <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//       {gamification.map((item) => {
//         if (userRole === "endUser") {
//           console.log(`GamificationList: Rendering UserGamificationCard for item ID ${item.id}`);
//           return <UserGamificationCard key={item.id} item={item} />;
//         } else if (userRole === "brandAdmin") {
//           console.log(`GamificationList: Rendering BrandGamificationCard for item ID ${item.id}`);
          
//           // FIX: Pass the onEdit and onDelete functions down to the card
//           return (
//             <BrandGamificationCard 
//               key={item.id} 
//               item={item} 
//               onEdit={onEdit} 
//               onDelete={onDelete} 
//             />
//           );
//         } else {
//           console.log(`GamificationList: Item ID ${item.id} skipped due to unknown/missing role.`);
//           return null;
//         }
//       })}
//     </div>
//   );
// };

// export default GamificationList;


// src/components/gamification/GamificationList.jsx
import React, { useEffect } from "react";
import BrandGamificationCard from "./BrandGamificationCard";

const GamificationList = ({ gamification, user, onEdit, onDelete }) => {
  const userRole = user?.user?.role;

  useEffect(() => {
    console.log("GamificationList received props:", { gamification, user });
    console.log("User role:", userRole);
    console.log("Number of gamification items:", gamification ? gamification.length : 0);
  }, [gamification, user, userRole]);

  if (!gamification || gamification.length === 0) {
    console.log("GamificationList: No data available, showing empty state.");
    return (
      <div className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
        No gamification data available
      </div>
    );
  }

  console.log("GamificationList: Rendering list with items for role:", userRole);

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {gamification.map((item) => {
        if (userRole === "endUser" || userRole === "influencer") {
          console.log(`GamificationList: Rendering UserGamificationCard for item ID ${item.id}`);
          // End users don't see edit/delete buttons
          return <BrandGamificationCard key={item.id} item={item} />;
        } else if (userRole === "brandAdmin") {
          console.log(`GamificationList: Rendering BrandGamificationCard for item ID ${item.id}`);
          
          // Pass the parent handlers (from Dashboard) to the card
          return (
            <BrandGamificationCard 
              key={item.id} 
              item={item} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          );
        } else {
          console.log(`GamificationList: Item ID ${item.id} skipped due to unknown/missing role.`);
          return null;
        }
      })}
    </div>
  );
};

export default GamificationList;