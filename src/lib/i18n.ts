import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

export const defaultNS = "translation";
export const resources = {
  en: {
    translation: {
      nav: {
        home: "Home",
        myBookings: "My Bookings",
        login: "Login",
      },
      hero: {
        badge: "Cambodia's #1 Modern Bus Ticketing Network",
        titlePrefix: "Travel Cambodia with",
        titleHighlight: "Confidence & Comfort",
        description:
          "Experience seamless intercity journeys. Browse hundreds of scheduled routes, select your preferred seat in real-time, and reserve within seconds.",
        oneWay: "One-way Trip",
        roundTrip: "Round-trip",
        instantPassBadge: "Instant E-Ticket Confirmation",
        departureCity: "Departure City",
        destinationCity: "Destination City",
        departureDate: "Departure Date",
        returnDate: "Return Date",
        searchBuses: "Search Buses",
      },
      stats: {
        happyTravelers: "Happy Travelers",
        dailyDepartures: "Daily Departures",
        provincialRoutes: "Provincial Routes",
        onTimeRate: "On-Time Rate",
      },
      promo: {
        badge: "Exclusive Online Promo",
        title: "Save 15% on All Night Sleeper Buses",
        description:
          "Enjoy comfortable air-conditioned berths with blankets, onboard Wi-Fi, and priority boarding. Use code",
        code: "GREENNIGHT",
        suffix: "at checkout.",
        bookNightBus: "Book Night Bus",
      },
      schedules: {
        timetable: "Daily Timetable",
        title: "Popular Schedules",
        subtitle:
          "Explore scheduled departure times across Cambodia's most traveled routes",
        type: "Schedule Type",
        dailyFixed: "Daily Fixed",
        arrivalTerminal: "Arrival Terminal",
        acExpress: "AC Express Bus",
        regularTrip: "Regular Trip",
      },
      whyChoose: {
        title: "Why Travelers Choose GreenBus",
        subtitle:
          "The modern standard for stress-free bus travel across Cambodia",
        safeTitle: "Safe & Secure",
        safeDesc:
          "100% verified operators, insured trips, and encrypted payments.",
        safeBadge: "Verified",
        priceTitle: "Best Price Guarantee",
        priceDesc:
          "Direct operator rates with zero hidden booking fees or markups.",
        priceBadge: "Best Value",
        instantTitle: "Instant Digital Pass",
        instantDesc:
          "Instant QR ticket sent straight to your phone with live updates.",
        instantBadge: "Fast & Easy",
        supportTitle: "24/7 Dedicated Support",
        supportDesc:
          "Friendly travel experts standing by to assist your journey anytime.",
        supportBadge: "Always Here",
      },
      reviews: {
        title: "Loved by 500,000+ Travelers",
        subtitle:
          "Real experiences from passengers exploring the Kingdom of Wonder",
        verifiedRider: "Verified Rider",
        r1: {
          name: "Sopheak L.",
          role: "Frequent Traveler",
          text: "Booked a night VIP sleeper in 2 minutes. The bus arrived on the exact minute and the ride was super smooth!",
          city: "Phnom Penh → Siem Reap",
        },
        r2: {
          name: "Marie D.",
          role: "Backpacker & Explorer",
          text: "Loved the interactive seat selection map! I picked my favorite window seat with no fuss. Highly recommend GreenBus.",
          city: "Siem Reap → Kampot",
        },
        r3: {
          name: "Alex T.",
          role: "Business Traveler",
          text: "Clean interface, competitive prices, and crystal clear ticket receipts. Hands down the best bus service app in Cambodia.",
          city: "Phnom Penh → Sihanoukville",
        },
      },
      cta: {
        title: "Ready for Your Next Cambodian Adventure?",
        description:
          "Book your tickets in advance to secure the best seats and lowest fares today.",
        button: "Find Your Bus",
      },
      footer: {
        tagline: "Fast, safe and reliable bus tickets across the region.",
        company: "Company",
        about: "About",
        careers: "Careers",
        press: "Press",
        blog: "Blog",
        contact: "Contact",
        cityCountry: "Phnom Penh, Cambodia",
        follow: "Follow",
        rights: "GreenBus. All rights reserved.",
      },
      language: {
        en: "English",
        km: "ភាសាខ្មែរ",
      },
    },
  },
  km: {
    translation: {
      nav: {
        home: "ទំព័រដើម",
        myBookings: "សំបុត្ររបស់ខ្ញុំ",
        login: "ចូលគណនី",
      },
      hero: {
        badge: "បណ្ដាញកក់សំបុត្រឡានក្រុងទំនើបឈានមុខគេនៅកម្ពុជា",
        titlePrefix: "ធ្វើដំណើរទូទាំងប្រទេសកម្ពុជាដោយ",
        titleHighlight: "ទំនុកចិត្ត និងផាសុកភាព",
        description:
          "ទទួលបានបទពិសោធន៍ធ្វើដំណើរកាន់តែងាយស្រួល។ ស្វែងរកជើងរថយន្តរាប់រយខ្សែ ជ្រើសរើសកៅអីដែលលោកអ្នកពេញចិត្តភ្លាមៗ និងកក់បានយ៉ាងរហ័ស។",
        oneWay: "ជើងទៅមួយផ្លូវ",
        roundTrip: "ជើងទៅ-មក",
        instantPassBadge: "ការបញ្ជាក់សំបុត្រអេឡិចត្រូនិចភ្លាមៗ",
        departureCity: "ទីក្រុងចេញដំណើរ",
        destinationCity: "ទីក្រុងគោលដៅ",
        departureDate: "កាលបរិច្ឆេទចេញដំណើរ",
        returnDate: "កាលបរិច្ឆេទត្រឡប់មកវិញ",
        searchBuses: "ស្វែងរកឡានក្រុង",
      },
      stats: {
        happyTravelers: "អ្នកដំណើរពេញចិត្ត",
        dailyDepartures: "ជើងចេញដំណើរប្រចាំថ្ងៃ",
        provincialRoutes: "ផ្លូវឆ្លងខេត្ត",
        onTimeRate: "អត្រាទៀងទាត់ពេលវេលា",
      },
      promo: {
        badge: "ការផ្តល់ជូនពិសេសតាមអនឡាញ",
        title: "បញ្ចុះតម្លៃ ១៥% លើរាល់ឡានក្រុងគេងពេលយប់",
        description:
          "រីករាយជាមួយគ្រែគេងម៉ាស៊ីនត្រជាក់ផាសុកភាព ភួយ មានវ៉ាយហ្វាយលើឡាន និងការឡើងរថយន្តមុនគេ។ ប្រើកូដ",
        code: "GREENNIGHT",
        suffix: "ពេលទូទាត់ប្រាក់។",
        bookNightBus: "កក់រថយន្តយប់",
      },
      schedules: {
        timetable: "កាលវិភាគប្រចាំថ្ងៃ",
        title: "កាលវិភាគពេញនិយម",
        subtitle: "ស្វែងយល់ពីពេលវេលាចេញដំណើរតាមផ្លូវពេញនិយមបំផុតក្នុងប្រទេសកម្ពុជា",
        type: "ប្រភេទកាលវិភាគ",
        dailyFixed: "ចេញដំណើររាល់ថ្ងៃ",
        arrivalTerminal: "ចំណតគោលដៅ",
        acExpress: "ឡានក្រុងម៉ាស៊ីនត្រជាក់",
        regularTrip: "ជើងធម្មតា",
      },
      whyChoose: {
        title: "ហេតុអ្វីអ្នកដំណើរជ្រើសរើស GreenBus?",
        subtitle: "ស្តង់ដារទំនើបសម្រាប់ការធ្វើដំណើរដោយគ្មានក្តីបារម្ភក្នុងប្រទេសកម្ពុជា",
        safeTitle: "សុវត្ថិភាព និងទំនុកចិត្ត",
        safeDesc: "ក្រុមហ៊ុនដៃគូត្រូវបានផ្ទៀងផ្ទាត់ ១០០% ការធ្វើដំណើរមានធានារ៉ាប់រង និងការទូទាត់ប្រកបដោយសុវត្ថិភាព។",
        safeBadge: "ផ្ទៀងផ្ទាត់រួច",
        priceTitle: "ធានាតម្លៃល្អបំផុត",
        priceDesc: "តម្លៃផ្ទាល់ពីក្រុមហ៊ុនរថយន្ត គ្មានការគិតថ្លៃសេវាបន្ថែមលាក់បាំង។",
        priceBadge: "តម្លៃសមរម្យបំផុត",
        instantTitle: "សំបុត្រឌីជីថលភ្លាមៗ",
        instantDesc: "សំបុត្រ QR កូដផ្ញើជូនទូរស័ព្ទដៃរបស់លោកអ្នកភ្លាមៗ ជាមួយការជូនដំណឹងបន្តផ្ទាល់។",
        instantBadge: "រហ័ស និងងាយស្រួល",
        supportTitle: "សេវាបម្រើអតិថិជន ២៤/៧",
        supportDesc: "ក្រុមការងាររង់ចាំជួយសម្រួលការធ្វើដំណើររបស់លោកអ្នកគ្រប់ពេលវេលា។",
        supportBadge: "នៅក្បែរអ្នកជានិច្ច",
      },
      reviews: {
        title: "ទទួលបានការគាំទ្រពីអ្នកដំណើរជាង ៥០០,០០០+ នាក់",
        subtitle: "បទពិសោធន៍ពិតពីអ្នកដំណើរដែលធ្វើដំណើរកម្សាន្តទូទាំងព្រះរាជាណាចក្រកម្ពុជា",
        verifiedRider: "អ្នកដំណើរពិតប្រាកដ",
        r1: {
          name: "សុភក្តិ ល.",
          role: "អ្នកធ្វើដំណើរញឹកញាប់",
          text: "កក់ឡាន VIP គេងយប់ចំណាយពេលត្រឹមតែ ២ នាទី។ ឡានចេញដំណើរទៀងទាត់ម៉ោង ហើយការជិះមានផាសុកភាពខ្លាំង!",
          city: "ភ្នំពេញ → សៀមរាប",
        },
        r2: {
          name: "ម៉ារី ឌ.",
          role: "អ្នកទេសចរស្ពាយកាតាប",
          text: "ពេញចិត្តប្លង់ជ្រើសរើសកៅអីខ្លាំងណាស់! ខ្ញុំបានជ្រើសរើសកៅអីក្បែរបង្អួចយ៉ាងងាយស្រួល។ ណែនាំឱ្យប្រើប្រាស់ GreenBus។",
          city: "សៀមរាប → កំពត",
        },
        r3: {
          name: "អាឡិច ថ.",
          role: "អ្នកធ្វើដំណើរធុរកិច្ច",
          text: "ផ្ទៃកម្មវិធីស្អាត តម្លៃសមរម្យ និងបង្កាន់ដៃសំបុត្រច្បាស់លាស់។ ជាកម្មវិធីកក់សំបុត្រឡានក្រុងដ៏ល្អបំផុតនៅកម្ពុជា។",
          city: "ភ្នំពេញ → ព្រះសីហនុ",
        },
      },
      cta: {
        title: "ត្រៀមខ្លួនរួចរាល់សម្រាប់ការធ្វើដំណើរបន្ទាប់ហើយឬនៅ?",
        description: "កក់សំបុត្រជាមុនដើម្បីទទួលបានកៅអីល្អ និងតម្លៃពិសេសនៅថ្ងៃនេះ។",
        button: "ស្វែងរកឡានក្រុងរបស់អ្នក",
      },
      footer: {
        tagline: "សំបុត្រឡានក្រុងរហ័ស សុវត្ថិភាព និងអាចទុកចិត្តបានទូទាំងប្រទេស។",
        company: "ក្រុមហ៊ុន",
        about: "អំពីយើង",
        careers: "ឱកាសការងារ",
        press: "ព័ត៌មាន",
        blog: "ប្លុក",
        contact: "ទំនាក់ទំនង",
        cityCountry: "រាជធានីភ្នំពេញ កម្ពុជា",
        follow: "តាមដានពួកយើង",
        rights: "GreenBus រក្សាសិទ្ធិគ្រប់យ៉ាង។",
      },
      language: {
        en: "English",
        km: "ភាសាខ្មែរ",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    lng: localStorage.getItem("i18nextLng") || "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
