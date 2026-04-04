import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Shield, Users, Clock, Headphones, CheckCircle, TrendingUp } from "lucide-react";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site-brand";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="container py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">
            Hakkımızda
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Türkiye&apos;nin oyuncu alışveriş platformu olarak dijital ürün ve hesap
            ticaretinde güven odaklı hizmet sunuyoruz.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Users, value: "50,000+", label: "Aktif Kullanıcı" },
            { icon: TrendingUp, value: "100,000+", label: "Başarılı Satış" },
            { icon: Shield, value: "%99.8", label: "Memnuniyet Oranı" },
            { icon: Clock, value: "7/24", label: "Destek" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center">
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-2xl font-black text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              Misyonumuz
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {SITE_NAME} olarak amacımız, oyun tutkunlarına güvenli, hızlı ve şeffaf
              bir alışveriş deneyimi sunmak. Alıcı korumalı sistemimizle her
              satın alma işleminde kullanıcılarımızın yanındayız.
            </p>
            <ul className="space-y-2">
              {[
                "Alıcı korumalı ödeme sistemi",
                "Doğrulanmış satıcılar",
                "7/24 teknik destek",
                "Anında teslimat garantisi",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8">
            <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-center text-muted-foreground">
              Tüm satıcılarımız kimlik doğrulamasından geçer ve 
              satış geçmişi izlenir.
            </p>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-card border border-border rounded-2xl p-8 text-center">
          <Headphones className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Bize Ulaşın</h2>
          <p className="text-muted-foreground mb-4">
            Sorularınız için 7/24 destek ekibimize ulaşabilirsiniz.
          </p>
          <p className="text-primary font-medium">{SUPPORT_EMAIL}</p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
