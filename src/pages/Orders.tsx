import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingBag, Truck, CheckCircle2, Clock, XCircle, ChevronRight, MessageSquare, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const DUMMY_ORDERS = [
  {
    id: "ORD-738291",
    title: "Yeşil Faktör! Teslimat! 300 Övgü CS2 Hesap",
    price: "49,90 ₺",
    date: "Bugün, 10:45",
    status: "completed", // completed, pending, cancelled
    seller: "IlkanShop",
    image: "bg-gradient-to-br from-orange-600/40 to-yellow-700/30"
  },
  {
    id: "ORD-738285",
    title: "Valorant Radiant Hesap - Tüm Skinler Açık",
    price: "4.500,00 ₺",
    date: "Dün, 22:15",
    status: "pending",
    seller: "MarcusStore",
    image: "bg-gradient-to-br from-red-600/40 to-pink-700/30"
  },
  {
    id: "ORD-738112",
    title: "5000 Robux - Hemen Teslim",
    price: "1.099,90 ₺",
    date: "28 Mart 2024",
    status: "cancelled",
    seller: "RZShop",
    image: "bg-gradient-to-br from-green-600/40 to-emerald-700/30"
  }
];

const Orders = () => {
  const [activeTab, setActiveTab] = useState("bought"); // bought, sold

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/20 text-success border-none"><CheckCircle2 className="h-3 w-3 mr-1" /> Tamamlandı</Badge>;
      case "pending":
        return <Badge className="bg-orange-500/20 text-orange-400 border-none"><Clock className="h-3 w-3 mr-1" /> Onay Bekliyor</Badge>;
      case "cancelled":
        return <Badge className="bg-destructive/20 text-destructive border-none"><XCircle className="h-3 w-3 mr-1" /> İptal Edildi</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Siparişlerim</h1>
            <p className="text-muted-foreground mt-1 text-sm">Satın aldığınız ve sattığınız ürünlerin takibini buradan yapabilirsiniz.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl gap-2 font-bold"><Search className="h-4 w-4" /> Sipariş Ara</Button>
            <Button className="bg-primary text-primary-foreground font-bold rounded-xl">Yardım Merkezi</Button>
          </div>
        </div>

        <Tabs defaultValue="bought" className="space-y-6" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between border-b border-border pb-1">
            <TabsList className="bg-transparent h-12 p-0 gap-6">
              <TabsTrigger 
                value="bought" 
                className="rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-primary h-full px-1 font-bold text-base transition-all"
              >
                <ShoppingBag className="h-4 w-4 mr-2" /> Aldıklarım
              </TabsTrigger>
              <TabsTrigger 
                value="sold" 
                className="rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-primary h-full px-1 font-bold text-base transition-all"
              >
                <Truck className="h-4 w-4 mr-2" /> Sattıklarım
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bought" className="mt-0">
            <div className="space-y-4">
              {DUMMY_ORDERS.length > 0 ? (
                DUMMY_ORDERS.map((order) => (
                  <Card key={order.id} className="border-border bg-card overflow-hidden transition-all hover:bg-secondary/20 hover:border-primary/20 group">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row md:items-center p-5 gap-6">
                        {/* Order info */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className={cn("w-20 h-20 rounded-2xl shrink-0 group-hover:scale-105 transition-transform duration-500", order.image)} />
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{order.id}</span>
                              {getStatusBadge(order.status)}
                            </div>
                            <h3 className="font-bold text-foreground text-sm truncate pr-4">{order.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-medium text-primary">Satıcı: {order.seller}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {order.date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-8">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Toplam Tutar</p>
                            <p className="text-lg font-extrabold text-accent">{order.price}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link to="/messages">
                              <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg bg-secondary text-foreground border-none font-bold gap-2">
                                <MessageSquare className="h-4 w-4" /> Sohbet
                              </Button>
                            </Link>
                            <Button size="sm" className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-bold gap-2">
                              Detaylar <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">Sipariş Bulunmuyor</h4>
                  <p className="text-sm text-muted-foreground max-w-sm">Henüz bir ürün satın almadınız. Kategorilere göz atarak alışverişe başlayabilirsiniz.</p>
                  <Link to="/category">
                    <Button className="bg-primary px-8 rounded-xl font-bold">Alışverişe Başla</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sold" className="mt-0">
             <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 bg-muted/20 rounded-3xl border border-dashed border-border">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <Truck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-bold text-foreground">Satış Bulunmuyor</h4>
                <p className="text-sm text-muted-foreground max-w-sm">Henüz bir satış gerçekleştirmediniz. İlan ekleyerek satış yapmaya başlayabilirsiniz.</p>
                <Link to="/add-listing">
                  <Button className="bg-primary px-8 rounded-xl font-bold">Hemen İlan Ekle</Button>
                </Link>
              </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
