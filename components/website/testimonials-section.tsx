'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Security Analyst",
    company: "TechCorp",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    content: "DropSentinel has become an essential part of our security toolkit. The real-time monitoring and VirusTotal integration provide peace of mind that our downloads are always protected.",
    highlight: "Essential Security Tool"
  },
  {
    name: "Michael Rodriguez",
    role: "IT Administrator",
    company: "StartupXYZ",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    content: "The modern UI and cross-platform support make it perfect for our diverse team. Setup was incredibly easy, and the background monitoring works flawlessly.",
    highlight: "Perfect for Teams"
  },
  {
    name: "Emily Johnson",
    role: "Freelance Developer",
    company: "Independent",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    content: "As someone who downloads a lot of development tools, DropSentinel gives me confidence that everything is safe. The quarantine feature saved me from a false positive once!",
    highlight: "Developer Approved"
  },
  {
    name: "David Park",
    role: "Cybersecurity Consultant",
    company: "SecureNet",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    content: "The detailed analytics and scan history are incredibly valuable for security audits. Being open source adds an extra layer of trust that proprietary solutions can't match.",
    highlight: "Security Expert Choice"
  },
  {
    name: "Lisa Thompson",
    role: "Content Creator",
    company: "Creative Studio",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    content: "I love how lightweight it is - doesn't slow down my system at all. The notifications are helpful without being intrusive, and the dark mode looks amazing!",
    highlight: "Creator Friendly"
  },
  {
    name: "Alex Kumar",
    role: "System Administrator",
    company: "Enterprise Corp",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    content: "Deployed across 200+ workstations with zero issues. The customizable settings and enterprise-friendly features make it perfect for large organizations.",
    highlight: "Enterprise Ready"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Security Professionals
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what security experts, developers, and everyday users are saying about DropSentinel
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={testimonial.name} variants={fadeInUp}>
              <Card className="h-full group hover:shadow-xl transition-all duration-500 border-2 hover:border-primary/20 relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <Quote className="w-12 h-12 text-primary" />
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {testimonial.highlight}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="font-medium">4.9/5</span>
            <span>•</span>
            <span>Based on 200+ reviews</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
