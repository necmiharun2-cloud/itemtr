import { useState } from "react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-12">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-center mb-12">
          İletişim
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Bize Ulaşın</h2>
              <p className="text-muted-foreground">
                Sorularınız, önerileriniz veya şikayetleriniz için bize ulaşabilirsiniz. 
                7/24 destek ekibimiz size yardımcı olmaya hazır.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Mail, label: "E-posta", value: "destek@itemtr.com" },
                { icon: Phone, label: "Telefon", value: "0850 123 45 67" },
                { icon: MapPin, label: "Adres", value: "İstanbul, Türkiye" },
                { icon: Clock, label: "Çalışma Saatleri", value: "7/24 Destek" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Adınız</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Adınızı girin"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">E-posta</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ornek@email.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Konu</label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Mesaj konusu"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mesajınız</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Mesajınızı yazın..."
                  rows={4}
                  className="w-full bg-secondary border border-border rounded-xl p-3 text-sm"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Gönder
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
