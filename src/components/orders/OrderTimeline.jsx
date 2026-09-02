import { Check, Flame, Package, ShoppingBag, Truck, X } from "lucide-react";

export default function OrderTimeline({ order }) {
  if (!order) return null;

  const orderStatus = order.order_status || "";
  const kitchenStatus = order.kitchen_status || "";
  const deliveryStatus = order.delivery_status || "";

  const isRejected = orderStatus === "Rejected";

  // Determine progression level (1 to 6)
  let level = 1;
  if (isRejected) {
    level = 0;
  } else if (orderStatus === "Completed" || orderStatus === "Delivered" || deliveryStatus === "Delivered") {
    level = 6;
  } else if (orderStatus === "Out for Delivery" || deliveryStatus === "Out for Delivery") {
    level = 5;
  } else if (orderStatus === "Ready" || kitchenStatus === "Ready") {
    level = 4;
  } else if (orderStatus === "Preparing" || kitchenStatus === "Preparing") {
    level = 3;
  } else if (orderStatus === "Accepted" || kitchenStatus === "Order Received") {
    level = 2;
  }

  const isCompleted = level === 6;

  // Define steps
  const steps = [
    {
      id: "placed",
      label: "ऑर्डर प्राप्त हुआ",
      description: "आपका ऑर्डर हमें मिल गया है।",
      icon: ShoppingBag,
      isCompleted: true,
      isActive: level === 1
    },
    {
      id: "accepted",
      label: "स्वीकृत (Accepted)",
      description: isRejected ? "ऑर्डर रद्द कर दिया गया" : "रसोई में ऑर्डर स्वीकार हुआ।",
      icon: isRejected ? X : Check,
      isCompleted: !isRejected && level >= 2,
      isActive: !isRejected && level === 2,
      isError: isRejected
    },
    {
      id: "preparing",
      label: "तैयार हो रहा है",
      description: "धीमी आंच पर गरमा-गरम पक रहा है।",
      icon: Flame,
      isCompleted: !isRejected && level >= 3,
      isActive: !isRejected && level === 3
    },
    {
      id: "ready",
      label: "पैकिंग पूर्ण (Ready)",
      description: "खाना पारंपरिक बर्तन में पैक है।",
      icon: Package,
      isCompleted: !isRejected && level >= 4,
      isActive: !isRejected && level === 4
    },
    {
      id: "delivery",
      label: "रास्ते में है (Out)",
      description: "डिलीवरी पार्टनर आपके घर की ओर है।",
      icon: Truck,
      isCompleted: !isRejected && level >= 5,
      isActive: !isRejected && level === 5
    },
    {
      id: "delivered",
      label: "पहुँच गया (Delivered)",
      description: "आनंद लें माँ के हाथों के स्वाद का!",
      icon: Check,
      isCompleted: !isRejected && level >= 6,
      isActive: !isRejected && level === 6
    }
  ];

  return (
    <div className="w-full py-6">
      <div className="relative flex flex-col gap-6 md:flex-row md:justify-between md:gap-2">
        {/* Connector Line (Desktop) */}
        <div className="absolute left-[21px] top-6 bottom-6 w-1 bg-[#E4A11B]/40 md:left-6 md:right-6 md:top-[22px] md:h-1 md:w-auto md:bottom-auto z-0" />
        
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isStepCompleted = step.isCompleted;
          const isStepActive = step.isActive;
          const isStepError = step.isError;

          let circleBg = "bg-[#FFF8EE] border-[#E4A11B]/60 text-[#3E2723]/40";
          let iconColor = "text-[#3E2723]/40";

          if (isStepError) {
            circleBg = "bg-red-100 border-red-600 text-red-700 z-10 ring-4 ring-red-200";
            iconColor = "text-red-700";
          } else if (isStepActive) {
            circleBg = "bg-[#E4A11B] border-[#7B2D26] text-[#7B2D26] z-10 ring-4 ring-[#E4A11B]/30 animate-pulse scale-110";
            iconColor = "text-[#7B2D26]";
          } else if (isStepCompleted) {
            circleBg = "bg-[#3D7A3A] border-[#3D7A3A] text-white z-10 shadow-md";
            iconColor = "text-white";
          }

          return (
            <div key={step.id} className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-2 flex-1 z-10">
              {/* Connector line for mobile */}
              {index < steps.length - 1 && (
                <div className={`absolute left-[21px] top-11 bottom-[-24px] w-1 md:hidden ${isStepCompleted && steps[index + 1].isCompleted ? "bg-[#3D7A3A]" : "bg-[#E4A11B]/40"}`} />
              )}
              
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 transition duration-300 ${circleBg}`}>
                <Icon size={20} className={`${iconColor} stroke-[2.5]`} />
              </div>

              <div className="flex flex-col md:items-center md:text-center mt-0.5 md:mt-2">
                <span className={`text-xs font-black font-desi-head ${isStepActive ? "text-[#7B2D26] scale-105" : isStepCompleted ? "text-[#3D7A3A]" : "text-[#3E2723]/60"}`}>
                  {step.label}
                </span>
                <span className="text-[10px] font-bold text-[#3E2723]/80 mt-0.5 leading-tight max-w-[120px]">
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
