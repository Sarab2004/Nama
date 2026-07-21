import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

type TranslationFile = {
  entries: Array<{
    english: string
    persian: string
  }>
  meta: {
    entryCount: number
  }
}

const translations: Record<string, string> = {
  Admin: 'مدیریت',
  'Admin Dashboard': 'داشبورد مدیریت',
  'All posts': 'همه نوشته‌ها',
  Author: 'نویسنده',
  Auto: 'خودکار',
  Contact: 'تماس',
  'Contact Form': 'فرم تماس',
  'Copied!': 'کپی شد!',
  Copy: 'کپی',
  'Core features': 'قابلیت‌های اصلی',
  Dashboard: 'داشبورد',
  'Dark Mode': 'حالت تیره',
  Dark: 'تیره',
  'Date Published': 'تاریخ انتشار',
  Doc: 'مورد',
  Docs: 'مورد',
  Email: 'ایمیل',
  Finance: 'مالی',
  'Full Name': 'نام کامل',
  Home: 'خانه',
  'Internal Server Error': 'خطای داخلی سرور',
  Language: 'زبان',
  Light: 'روشن',
  'Loading, please wait...': 'در حال بارگذاری، لطفا صبر کنید...',
  Message: 'پیام',
  News: 'اخبار',
  Next: 'بعدی',
  'No image': 'بدون تصویر',
  'No results found.': 'نتیجه‌ای پیدا نشد.',
  Page: 'صفحه',
  Pages: 'صفحه‌ها',
  Payload: 'Payload',
  'Payload Logo': 'لوگوی Payload',
  'Payload Website Template': 'قالب وب‌سایت Payload',
  Phone: 'تلفن',
  Post: 'نوشته',
  Posts: 'نوشته‌ها',
  Previous: 'قبلی',
  Preview: 'پیش‌نمایش',
  Project: 'پروژه',
  Projects: 'پروژه‌ها',
  Search: 'جستجو',
  'Search produced no results.': 'جستجو نتیجه‌ای نداشت.',
  'Select a language': 'انتخاب زبان',
  'Select a theme': 'انتخاب پوسته',
  Showing: 'نمایش',
  'Something went wrong.': 'مشکلی پیش آمد.',
  'Source Code': 'کد منبع',
  Submit: 'ارسال',
  Technology: 'فناوری',
  'This field is required': 'پر کردن این فیلد الزامی است',
  Theme: 'پوسته',
  'Untitled category': 'دسته‌بندی بدون عنوان',
  'You\'ve received a new message.': 'پیام جدیدی دریافت کرده‌اید.',
  copied: 'کپی شد!',
  of: 'از',
  submit: 'ارسال',

  'The contact form has been submitted successfully.': 'فرم تماس با موفقیت ارسال شد.',
  'Your contact form submission was successfully received.':
    'پیام فرم تماس شما با موفقیت دریافت شد.',
  'Visit the admin dashboard': 'به داشبورد مدیریت بروید',
  "to begin managing this site's content. The code for this template is completely open-source and can be found":
    'تا مدیریت محتوای این سایت را شروع کنید. کد این قالب کاملا متن‌باز است و در اینجا در دسترس است',
  'on our Github': 'در گیت‌هاب ما',
  "Manage this site's pages and posts from the": 'صفحه‌ها و نوشته‌های این سایت را از طریق',
  'admin dashboard': 'داشبورد مدیریت',
  'Using versions, drafts, and preview, editors can review and share their changes before publishing them.':
    'با استفاده از نسخه‌ها، پیش‌نویس‌ها و پیش‌نمایش، ویراستاران می‌توانند تغییرات خود را پیش از انتشار بررسی و به اشتراک بگذارند.',
  'Page Builder': 'صفحه‌ساز',
  'Custom page builder allows you to create unique page, post, and project layouts for any type of content.':
    'صفحه‌ساز سفارشی به شما اجازه می‌دهد برای هر نوع محتوا، چیدمان‌های منحصربه‌فرد برای صفحه، نوشته و پروژه بسازید.',
  'Editors have complete control over SEO data and site content directly from the':
    'ویراستاران کنترل کامل داده‌های سئو و محتوای سایت را مستقیما از طریق',
  'Users will experience this site in their preferred color scheme and each block can be inverted.':
    'کاربران سایت را با طرح رنگ دلخواه خود تجربه می‌کنند و هر بلوک می‌تواند به حالت معکوس نمایش داده شود.',
  'Recent posts': 'نوشته‌های اخیر',
  'The posts below are displayed in an "Archive" layout building block which is an extremely powerful way to display documents on a page. It can be auto-populated by collection or by category, or posts can be individually selected. Pagination controls will automatically appear if the number of results exceeds the number of items per page.':
    'نوشته‌های زیر در بلوک چیدمان «آرشیو» نمایش داده شده‌اند؛ روشی بسیار قدرتمند برای نمایش اسناد در یک صفحه. این بخش می‌تواند به‌صورت خودکار بر اساس کالکشن یا دسته‌بندی پر شود، یا نوشته‌ها به‌صورت جداگانه انتخاب شوند. اگر تعداد نتایج از تعداد آیتم‌های هر صفحه بیشتر شود، کنترل‌های صفحه‌بندی به‌صورت خودکار نمایش داده می‌شوند.',
  'This is a call to action': 'این یک فراخوان به اقدام است',
  'This is a custom layout building block': 'این یک بلوک چیدمان سفارشی است',
  'configured in the admin dashboard': 'که در داشبورد مدیریت پیکربندی شده است',
  'to make your account and seed content for your website.':
    'تا حساب خود را بسازید و محتوای اولیه وب‌سایتتان را ایجاد کنید.',

  'Dive into the marvels of modern innovation, where the only constant is change. A journey where pixels and data converge to craft the future.':
    'در شگفتی‌های نوآوری مدرن غوطه‌ور شوید؛ جایی که تنها چیز ثابت، تغییر است. سفری که در آن پیکسل‌ها و داده‌ها به هم می‌پیوندند تا آینده را بسازند.',
  'This content is fabricated and for demonstration purposes only. To edit this post,':
    'این محتوا ساختگی است و فقط برای نمایش نمونه استفاده می‌شود. برای ویرایش این نوشته،',
  'navigate to the admin dashboard': 'به داشبورد مدیریت بروید',
  'navigate to the admin dashboard.': 'به داشبورد مدیریت بروید.',
  'The Rise of AI and Machine Learning': 'ظهور هوش مصنوعی و یادگیری ماشین',
  'We find ourselves in a transformative era where artificial intelligence (AI) stands at the forefront of technological evolution. The ripple effects of its advancements are reshaping industries at an unprecedented pace. No longer are businesses bound by the limitations of tedious, manual processes. Instead, sophisticated machines, fueled by vast amounts of historical data, are now capable of making decisions previously left to human intuition. These intelligent systems are not only optimizing operations but also pioneering innovative approaches, heralding a new age of business transformation worldwide.':
    'ما در دوره‌ای تحول‌آفرین قرار داریم که در آن هوش مصنوعی (AI) در خط مقدم تکامل فناوری ایستاده است. اثرات پیشرفت‌های آن با سرعتی بی‌سابقه صنایع را بازآفرینی می‌کند. کسب‌وکارها دیگر به محدودیت‌های فرایندهای دستی و زمان‌بر وابسته نیستند؛ بلکه ماشین‌های پیشرفته، با تکیه بر حجم عظیمی از داده‌های تاریخی، اکنون می‌توانند تصمیم‌هایی بگیرند که پیش‌تر به شهود انسانی سپرده می‌شد. این سیستم‌های هوشمند نه‌تنها عملیات را بهینه می‌کنند، بلکه رویکردهای نوآورانه‌ای را پیش می‌برند و نویدبخش عصر تازه‌ای از تحول کسب‌وکار در سراسر جهان هستند.',
  'To demonstrate basic AI functionality, here is a javascript snippet that makes a POST request to a generic AI API in order to generate text based on a prompt.':
    'برای نمایش قابلیت پایه هوش مصنوعی، در اینجا یک قطعه کد جاوااسکریپت آمده است که برای تولید متن بر اساس یک پرامپت، یک درخواست POST به یک API عمومی هوش مصنوعی ارسال می‌کند.',
  "In today's rapidly evolving technological landscape, the Internet of Things (IoT) stands out as a revolutionary force. From transforming our residences with smart home systems to redefining transportation through connected cars, IoT's influence is palpable in nearly every facet of our daily lives.":
    'در چشم‌انداز فناوری که امروز با سرعت زیادی در حال تحول است، اینترنت اشیا (IoT) به‌عنوان نیرویی انقلابی برجسته شده است. از دگرگون‌کردن خانه‌های ما با سیستم‌های خانه هوشمند تا بازتعریف حمل‌ونقل از طریق خودروهای متصل، تاثیر اینترنت اشیا تقریبا در همه جنبه‌های زندگی روزمره ما قابل لمس است.',
  "This technology hinges on the seamless integration of devices and systems, allowing them to communicate and collaborate effortlessly. With each connected device, we move a step closer to a world where convenience and efficiency are embedded in the very fabric of our existence. As a result, we're transitioning into an era where our surroundings intuitively respond to our needs, heralding a smarter and more interconnected global community.":
    'این فناوری بر یکپارچگی بی‌وقفه دستگاه‌ها و سیستم‌ها تکیه دارد و به آن‌ها امکان می‌دهد به‌سادگی با یکدیگر ارتباط برقرار کرده و همکاری کنند. با هر دستگاه متصل، یک گام به جهانی نزدیک‌تر می‌شویم که در آن آسایش و کارایی در تار و پود زندگی ما تنیده شده است. در نتیجه، در حال ورود به عصری هستیم که محیط پیرامونمان به‌صورت هوشمندانه به نیازهای ما پاسخ می‌دهد و جامعه‌ای جهانی، هوشمندتر و به‌هم‌پیوسته‌تر را نوید می‌دهد.',
  "This content above is completely dynamic using custom layout building blocks configured in the CMS. This can be anything you'd like from rich text and images, to highly designed, complex components.":
    'محتوای بالا با استفاده از بلوک‌های چیدمان سفارشی که در CMS پیکربندی شده‌اند کاملا پویا است. این محتوا می‌تواند هر چیزی باشد؛ از متن غنی و تصویر گرفته تا کامپوننت‌های پیچیده و کاملا طراحی‌شده.',

  "Money isn't just currency;": 'پول فقط یک واحد مبادله نیست؛',
  "it's a language.": 'بلکه یک زبان است.',
  'Dive deep into its nuances, where strategy meets intuition in the vast sea of finance.':
    'در ظرافت‌های آن عمیق شوید؛ جایی که استراتژی در دریای گسترده مالی با شهود تلاقی می‌کند.',
  "Money, in its essence, transcends the mere concept of coins and paper notes; it becomes a profound language that speaks of value, trust, and societal structures. Like any language, it possesses intricate nuances and subtleties that require a discerning understanding. It's in these depths where the calculated world of financial strategy collides with the raw, instinctive nature of human intuition. Just as a seasoned linguist might dissect the syntax and semantics of a sentence, a financial expert navigates the vast and tumultuous ocean of finance, guided not only by logic and data but also by gut feelings and foresight. Every transaction, investment, and financial decision becomes a dialogue in this expansive lexicon of commerce and value.":
    'پول در ماهیت خود از مفهوم ساده سکه و اسکناس فراتر می‌رود؛ به زبانی عمیق تبدیل می‌شود که از ارزش، اعتماد و ساختارهای اجتماعی سخن می‌گوید. مانند هر زبان دیگری، ظرافت‌ها و نکات پیچیده‌ای دارد که درک دقیق می‌طلبد. در همین عمق است که جهان حساب‌شده استراتژی مالی با ماهیت خام و غریزی شهود انسانی برخورد می‌کند. همان‌طور که یک زبان‌شناس باتجربه ساختار و معنای یک جمله را تحلیل می‌کند، یک متخصص مالی نیز در اقیانوس گسترده و پرتلاطم مالی حرکت می‌کند؛ نه‌تنها با منطق و داده، بلکه با حس درونی و آینده‌نگری. هر تراکنش، سرمایه‌گذاری و تصمیم مالی به گفت‌وگویی در این واژگان گسترده تجارت و ارزش تبدیل می‌شود.',
  'Stock Market Dynamics: Bulls, Bears, and the Uncertain Middle':
    'پویایی بازار سهام: گاوها، خرس‌ها و میانه نامطمئن',
  'The stock market is a realm of vast opportunity but also poses risks. Discover the forces that drive market trends and the strategies employed by top traders to navigate this complex ecosystem. From market analysis to understanding investor psychology, get a comprehensive insight into the world of stocks.':
    'بازار سهام قلمرویی سرشار از فرصت‌های گسترده است، اما ریسک‌های خود را نیز دارد. نیروهایی را بشناسید که روندهای بازار را شکل می‌دهند و استراتژی‌هایی را کشف کنید که معامله‌گران برتر برای حرکت در این اکوسیستم پیچیده به کار می‌گیرند. از تحلیل بازار تا شناخت روان‌شناسی سرمایه‌گذاران، نگاهی جامع به دنیای سهام به دست آورید.',
  "The stock market, often visualized as a bustling arena of numbers and ticker tapes, is as much about human behavior as it is about economics. It's a place where optimism, represented by the bullish rally, meets the caution of bearish downturns, with each vying to dictate the market's direction. But between these two extremes lies an uncertain middle ground, a zone populated by traders and investors who constantly weigh hope against fear. Successful navigation requires more than just financial acumen; it demands an understanding of collective sentiments and the ability to predict not just market movements, but also the reactions of other market participants. In this intricate dance of numbers and nerves, the most astute players are those who master both the hard data and the soft nuances of human behavior.":
    'بازار سهام که اغلب به‌صورت صحنه‌ای پرهیاهو از اعداد و نوارهای قیمت تصور می‌شود، به همان اندازه که به اقتصاد مربوط است، به رفتار انسانی نیز وابسته است. جایی است که خوش‌بینی، با رالی صعودی نمادین می‌شود و با احتیاط روندهای نزولی روبه‌رو می‌گردد؛ هر کدام تلاش می‌کنند مسیر بازار را تعیین کنند. اما میان این دو قطب، محدوده‌ای نامطمئن قرار دارد؛ جایی که معامله‌گران و سرمایه‌گذاران پیوسته امید را در برابر ترس می‌سنجند. حرکت موفق در این فضا تنها به دانش مالی نیاز ندارد؛ بلکه مستلزم درک احساسات جمعی و توانایی پیش‌بینی نه فقط حرکت بازار، بلکه واکنش سایر بازیگران بازار است. در این رقص پیچیده اعداد و احساسات، هوشمندترین بازیگران کسانی هستند که هم داده‌های سخت و هم ظرافت‌های نرم رفتار انسانی را به‌خوبی درک می‌کنند.',
  "Money isn't just currency; it's a language. Dive deep into its nuances, where strategy meets intuition in the vast sea of finance.":
    'پول فقط یک واحد مبادله نیست؛ بلکه یک زبان است. در ظرافت‌های آن عمیق شوید؛ جایی که استراتژی در دریای گسترده مالی با شهود تلاقی می‌کند.',

  'Explore the untold and overlooked. A magnified view into the corners of the world, where every story deserves its spotlight.':
    'ناگفته‌ها و نادیده‌ها را کشف کنید. نگاهی بزرگ‌نمایی‌شده به گوشه‌های جهان؛ جایی که هر داستان شایسته دیده‌شدن است.',
  "Throughout history, regions across the globe have faced the devastating impact of natural disasters, the turbulence of political unrest, and the challenging ripples of economic downturns. In these moments of profound crisis, an often-underestimated force emerges: the indomitable resilience of the human spirit. These aren't just tales of mere survival, but stories of communities forging bonds, uniting with a collective purpose, and demonstrating an innate ability to overcome.":
    'در طول تاریخ، مناطق مختلف جهان با اثرات ویرانگر بلایای طبیعی، آشفتگی ناآرامی‌های سیاسی و پیامدهای دشوار رکودهای اقتصادی روبه‌رو شده‌اند. در این لحظات بحران عمیق، نیرویی که اغلب دست‌کم گرفته می‌شود پدیدار می‌گردد: تاب‌آوری شکست‌ناپذیر روح انسان. این‌ها فقط روایت‌هایی از بقا نیستند، بلکه داستان‌هایی از جوامعی هستند که پیوند می‌سازند، حول هدفی مشترک متحد می‌شوند و توانایی ذاتی خود برای عبور از سختی‌ها را نشان می‌دهند.',
  'From neighbors forming makeshift rescue teams during floods to entire cities rallying to rebuild after economic collapse, the essence of humanity is most evident in these acts of solidarity. As we delve into these narratives, we witness the transformative power of community spirit, where adversity becomes a catalyst for growth, unity, and a brighter, rebuilt future.':
    'از همسایگانی که هنگام سیل گروه‌های نجات موقت تشکیل می‌دهند تا شهرهایی که پس از فروپاشی اقتصادی برای بازسازی بسیج می‌شوند، جوهر انسانیت بیش از هر جا در این کنش‌های همبستگی آشکار می‌شود. با ورود به این روایت‌ها، قدرت تحول‌آفرین روح جمعی را می‌بینیم؛ جایی که سختی به محرکی برای رشد، اتحاد و آینده‌ای روشن‌تر و بازساخته تبدیل می‌شود.',
}

const filePath = path.resolve(process.cwd(), 'translations.source.json')
const data = JSON.parse(await readFile(filePath, 'utf8')) as TranslationFile
const missing = new Set<string>()

for (const entry of data.entries) {
  const translation = translations[entry.english]
  if (translation) {
    entry.persian = translation
  } else {
    missing.add(entry.english)
  }
}

if (missing.size > 0) {
  console.error('Missing translations:')
  for (const item of missing) console.error(`- ${item}`)
  process.exit(1)
}

data.meta.entryCount = data.entries.length
await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
console.log(`Filled ${data.entries.length} Persian translations in ${filePath}`)
