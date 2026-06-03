import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

const values = [
  {
    title: "Quality Craftsmanship",
    description: "Every piece is meticulously crafted using premium materials and time-honored techniques."
  },
  {
    title: "Sustainable Practices",
    description: "We prioritize eco-friendly materials and ethical manufacturing processes."
  },
  {
    title: "Timeless Design",
    description: "Our collections are designed to transcend seasonal trends and last for years."
  },
  {
    title: "Inclusive Fashion",
    description: "Fashion for everyone - regardless of age, size, or background."
  },
]

const team = [
  {
    name: "Alexandra Chen",
    role: "Founder & Creative Director",
    image: "/images/hero-women.jpg"
  },
  {
    name: "Marcus Rivera",
    role: "Head of Design",
    image: "/images/hero-men.jpg"
  },
  {
    name: "Sarah Mitchell",
    role: "Sustainability Lead",
    image: "/images/hero-women.jpg"
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[500px]">
          <Image
            src="/images/hero-men.jpg"
            alt="About ADONIS"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-foreground/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="font-serif text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
                Our Story
              </h1>
              <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
                Redefining fashion with purpose, passion, and timeless elegance
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Our Mission
              </p>
              <h2 className="mt-4 font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
                Fashion that tells a story
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Founded in 2020, ADONIS was born from a simple belief: fashion should be 
                both beautiful and meaningful. We create clothing that not only looks 
                exceptional but also respects our planet and the people who make it.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Every stitch, every fabric choice, and every design decision reflects our 
                commitment to quality, sustainability, and timeless style. We believe that 
                when you invest in well-made clothing, you invest in a more sustainable future.
              </p>
            </div>
            <div className="relative aspect-[4/5]">
              <Image
                src="/images/hero-women.jpg"
                alt="Our craftsmanship"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="text-center mb-12">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                What We Stand For
              </p>
              <h2 className="mt-4 font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
                Our Values
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-foreground text-background font-serif text-xl">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-medium text-foreground">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center mb-12">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              The People Behind ADONIS
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
              Meet Our Team
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="relative aspect-[3/4] overflow-hidden mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="text-lg font-medium text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-serif text-3xl font-light tracking-tight md:text-4xl">
                Join Our Journey
              </h2>
              <p className="mt-6 text-lg text-background/70 leading-relaxed">
                Experience the ADONIS difference. Explore our collections and discover 
                fashion that aligns with your values.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" variant="outline" className="border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground">
                  <Link href="/catalog/all">
                    Shop Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground">
                  <Link href="/signup">
                    Create Account
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
