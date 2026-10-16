/** Public, confirmed catalogue only. Do not put prompts or experiment logs here. */
export interface Song {
 id: number; title: string; featured: boolean; core: boolean; art?: string; artworkKind?: 'concept' | 'official';
 accent: string; description: string; x: number; y: number;
 sourceOrder?: number; preview?: string; previewStart?: number; previewDuration?: number; previewStatus?: 'ready' | 'missing' | 'unconfirmed';
 audio?: string; language?: string; release?: string; albumId?: string;
 subtitle?: string; origin?: string | string[]; interpretation?: string[]; lyrics?: string[]; externalUrl?: string;
 lyricGroups?: string[][];
 dedication?: {label: string; text: string};
 audioDuration?: number; showRelatedWorks?: boolean;
 legacyIntent?: string;
}
export interface Album {
 id: string; title: string; subtitle?: string; cover?: string;
 concept?: string; description?: string; songIds: number[];
}
const titles=['我们隔着从前相爱','格林尼治','物我','Leave the Hallway Light On','AFTERIMAGE','Minority of One','Almost There','A Violet Afterglow','梦不识人老','红鸾'];
const positions=[[15,32],[34,21],[45,47],[65,33],[77,58],[31,70],[10,67],[87,24],[65,82],[91,80]];
const accents=['#d3a9b3','#91b8c6','#aabb99','#dcac73','#b5bdcc','#d1d0ba','#93b0c1','#b4a2cd','#c1b99e','#c78472'];
const descriptions=['梦幻引力 · 重复与游戏式 Hook','Noir Trip-Hop · 冷感模拟电子','感知与边界 · 自然与自我','1970s Psychedelic Soul × Slow Funk','概念视觉研究 · 详情筹备中','概念视觉研究 · 详情筹备中','独立创作信号 · 详情筹备中','独立创作信号 · 详情筹备中','独立创作信号 · 详情筹备中','独立创作信号 · 详情筹备中'];

export const songs: Song[] = titles.map((title,i)=>({title,id:i+1,featured:i<9,core:i<6,accent:accents[i],description:descriptions[i],art:`/artwork/${String(i+1).padStart(2,'0')}.svg`,artworkKind:'concept',x:positions[i][0],y:positions[i][1],...(i===3?{
 audio:'/audio/hallway.mp3', language:'英语',
 "art": "/artwork/04-official.png",
 "artworkKind": "official",
 "origin": [
  "《Leave the Hallway Light On》始于一个带有心理悬疑色彩的亲密关系设想：当两个人仍然共享日常与身体上的亲近，一方却开始怀疑，眼前的恋人是否已经悄然变成了另一个人。",
  "创作没有通过明确的事件证明这种变化，而是将疑虑隐藏在香气、眼神、称呼与语言停顿等熟悉的细节中。歌曲以全英文写作，让亲密感与陌生感持续交错，保留现实心理变化与超自然解释之间的模糊地带。",
  "音乐选择七十年代迷幻灵魂乐与慢速 Funk 的融合方向，通过具有催眠感的节奏，赋予这段关系一种既性感又不安的气质。走廊里始终亮着的灯，则成为贯穿整首歌的视觉与叙事线索。"
 ],
 "interpretation": [
  "有些陌生，并不发生在距离拉远之后，反而藏在最亲密的时刻。",
  "气味依旧熟悉，呼吸仍在耳畔，肌肤记得彼此的温度。只是某个眼神、某一句称呼，开始出现微不可察的偏差。像一段听过无数遍的旋律，音符仍然相同，却不知从哪里起，悄悄走了调。",
  "人究竟从哪一刻开始变得不同？那些无法证实的变化，或许来自对方，或许来自记忆与现实之间不断偏移的距离。亲密没有因此消失，欲望与疑虑反而在同一片温柔里生长。",
  "走廊的灯始终亮着。它照得到交叠的影子，却照不清熟悉感从何处开始松动。光亮不再意味着看清一切，而更像一种迟迟不愿结束的确认。",
  "后来她离开了，灯还亮着。"
 ],
 "lyricGroups": [
  [
   "Leave the hallway light on",
   "I wanna know if you're still you"
  ],
  [
   "Say my name like you knew it before",
   "Not like you learned it tonight"
  ],
  [
   "The light stayed on",
   "I still couldn't see you"
  ]
 ],
 "showRelatedWorks": false,
 legacyIntent:'以英文 AI 辅助音乐创作为载体，探索 1970s Psychedelic Soul 与 Slow Funk 的交汇。以复古音色与空间感建立作品的听觉气质。'
}:{}),...(i===0?{
 art:'/artwork/01-official.png', artworkKind:'official' as const,
 subtitle:'轻盈梦感 · 未完成的靠近',
 audio:'/audio/through-the-past.mp3', audioDuration:259,
 origin:[
  '作品最初围绕梦幻、松弛的流行音乐氛围展开构思，尝试在轻盈的听感与复杂的情绪表达之间建立平衡。',
  '随着创作推进，主题逐渐明确，歌词结构与音乐表现也经历了多轮调整。创作重点始终围绕旋律的辨识度、情绪的自然递进，以及各部分之间的整体协调性展开。',
  '最终版本在反复试听与比较后确立，并未完全拘泥于最初的构想，而是根据实际呈现效果不断调整与取舍，形成了如今的作品形态。'
 ],
 interpretation:[
  '有些故事，明明已经翻到最后一页，梦却还在替它续写开头。',
  '时间在这里并不笔直向前。倒数可以把夜晚一层层拆开，游戏也可以暂时取消输赢。那些本该走向结束的瞬间，因此获得了片刻停留的资格。',
  '这首歌想象的，不是现实被改写，而是梦境短暂松开了现实的规则。于是已经错过的关系，得以隔着从前，再靠近一次。'
 ],
 lyrics:['我闭眼　我醒来　我在你梦里游荡','一整夜没来得及下的雨','沿着你的睫毛返航'],
 showRelatedWorks:false
}:{}),...(i===1?{
 art:'/artwork/02-official.png', artworkKind:'official' as const,
 audio:'/audio/greenwich.mp3', audioDuration:315.960979,
 origin:[
  '创作始于对一种关系状态的思考：当两个人仍然存在于彼此的生活中，却逐渐成为彼此的过去，时间究竟在其中留下了什么？',
  '以格林尼治作为共同时间基准，创作将原本客观的时间坐标转化为关系中的感知差异。歌词选择粤语表达，弱化具体事件与因果解释，以日常问候、时间交错及延迟揭题的结构，呈现关系在岁月中悄然失步的过程。',
  '经过多轮歌词与音乐实验，最终保留暗色、克制的听觉气质，让声音中的距离感与文字中的时间命题彼此呼应。'
 ],
 interpretation:[
  '格林尼治为世界划定共同的零点，却无法让两个人拥有同一个今天。',
  '有些关系并没有明确的终场。问候依然可以抵达，熟悉的称谓也尚未失效，只是相同的话语，渐渐落进了不同的时间。没有谁特意停下，也没有谁真正走远，只是各自的生活悄然向前。',
  '当曾经共同经历的一切慢慢成为往事，留下来的或许不是某一个人，而是两个人都曾身处其中、如今却再也无法同时抵达的从前。'
 ],
 lyricGroups:[
  ['明明同一聲晚安','聽來卻像兩個夜晚'],
  ['格林尼治依舊','今夜又以誰作準'],
  ['不是誰留在從前','是從前留下我們']
 ],
 showRelatedWorks:false
}:{}),...(i===2?{
 art:'/artwork/03-official.png', artworkKind:'official' as const,
 description:'Cosmic Modal Jazz × Chamber Soul',
 audio:'/audio/wuwo.mp3', audioDuration:277.2135,
 origin:[
  '《物我》的创作始于两种不同尺度的思考：借由宏大的世界重新衡量个体的痛苦，同时从细微的日常感知中寻找幸福。',
  '这一立意逐渐延伸为对自我与万物关系的探索。创作选择以英文承载感知与思考的连续叙述，再通过中文 Hook 建立一组递进的自然类比：由树、海、山延伸至云、风、雾，最终抵达藤、沙、土，以生长、流动、沉积与消逝等共同规律，追问人与世界之间的边界。',
  '音乐采用 Cosmic Modal Jazz 与 Chamber Soul 的融合方向，以小编制器乐和持续变化的声部关系，呼应作品从微观感知走向广阔自然的表达。'
 ],
 interpretation:[
  '头发向树借来生长，眼泪与海共享潮汐，皱纹沿着山的褶皱延伸。那些被视为独属于人的变化，原来早已在万物身上反复发生。',
  '当痛苦被放进更辽阔的尺度，它未必因此消失，却不再占据全部视野。而幸福有时恰好相反：一束尚未命名的光，一点皮肤上的暖意，一次与大地重新接触的瞬间，已足够让人感受到世界的回应。',
  '或许人与自然从来不是彼此隔绝的两端。生长、流动、消逝与重生，都在不同的形态中持续发生。所谓自我，也许并非一道将世界阻挡在外的边界，而是万物暂时汇聚、又不断交换的地方。',
  '我究竟止于何处，世界又从哪里开始？'
 ],
 lyricGroups:[
  ['我的灵魂也会漂浮，游荡，消散','那我也是云吗'],
  ['我的思绪也会远行，无色，无形','那我也是风吗'],
  ['我的呼吸也会浮起，弥漫，散去','那我也是雾吗']
 ],
 showRelatedWorks:false
}:{}),...(i===4?{
 art:"/artwork/05-official.png", artworkKind:"official" as const,
 "description": "Psychedelic Melodic Trap-Soul × Hazy Bedroom R&B",
 "audio": "/audio/afterimage.mp3",
 "audioDuration": 181.1735,
 "albumId": "gewai",
 "origin": [
  "《AFTERIMAGE》的创作始于一种并不罕见、却难以准确描述的感受：当过去似乎已经远去，某个与之毫不相关的日常瞬间，却可能让曾经的情绪毫无预兆地重新浮现。",
  "作品借用了视觉中的两种现象作为表达结构：Afterimage，指光源消失后仍短暂停留的余像；Burn-In，则指影像留下的持久痕迹。前者构成歌曲的感官明线，后者成为逐渐显露的情绪暗线。歌词不交代具体的回忆来源，而是以色彩、轮廓与感知偏移承载这种无法主动控制的重现。",
  "音乐选择迷幻旋律 Trap-Soul 与朦胧卧室 R&B 的融合方向，通过深沉的 808、流动的合成器空间与短促的回声，营造介于清醒与恍惚之间的听觉状态。歌曲最终以突如其来的天光收束，让那些尚未完全褪去的影像，在一个瞬间失去依附的场景。"
 ],
 "interpretation": [
  "有些影像，在消失以后才开始显现。",
  "也许只是一种颜色，一束斜落的光，或某个毫不起眼的瞬间。眼前的事物忽然与记忆重叠，熟悉的轮廓在陌生的地方短暂浮现。没有刻意回望，也谈不上真正重逢，只是时间偶尔失去了先后。",
  "凝视时，它渐渐散开；移开目光，又仿佛仍停留在眼底。那些以为已经褪去的色彩，或许从未彻底离开，只是融进了更深的地方，成为一幅看不见的烧印。",
  "夜色仍在流动，边界一点点融化，旧日的形状像光一样经过身体。",
  "随后色彩渐薄，轮廓归位。",
  "一眨眼，天亮了。"
 ],
 "lyricGroups": [
  [
   "Right behind my eyes, afterimage, afterimage",
   "Thought it'd fade, maybe it burned in",
   "Let it pull me under, under, under, yeah"
  ],
  [
   "Then the colors thin",
   "The edges settle",
   "One blink, daylight"
  ]
 ],
 "showRelatedWorks": false
} :{}),...(i===5?{
 "art": "/artwork/06-official.png",
 "artworkKind": "official",
 "description": "Afro-R&B × Afrobeats",
 "audio": "/audio/minority-of-one.mp3",
 "audioDuration": 221.680167,
 "albumId": "gewai",
 "origin": [
  "《Minority of One》的创作始于对“少数”与身份归属的重新思考。最初的讨论涉及不同文化环境中的身份认知，但作品没有沿着国别、族裔或群体对立的方向展开，而是将问题转向个体本身：一个人是否必须被归入某种类别，才能获得明确的自我定义？",
  "创作过程中，歌名由《Minority》发展为《Minority of One》，歌词也逐渐舍弃具体的社会身份叙述，转而使用简洁、富有节奏感的英文短句，表达对外界分类的松弛回应。作品不将特立独行等同于孤独，也不把拒绝标签处理成激烈的对抗，而是强调个体对自身身份与行动方式的选择权。",
  "音乐采用 Afro-R&B 与 Afrobeats 的融合方向，以切分律动、圆润的低频运动、重复性 Hook 和快速节奏段落之间的对照，建立轻盈而坚定的表达：保持自己的节奏，并不意味着必须离开人群。"
 ],
 "interpretation": [
  "世界习惯用一些名字，把不同的人放进相似的格子。",
  "某种风格，某种立场，某种恰好能够被辨认的身份。那些分类有时方便理解，却未必足以容纳一个完整的人。总有一些部分无法归属，也没有必要为此寻找新的名称。",
  "不完全合拍，不意味着失去节奏；不属于某一边，也不代表站在所有人之外。可以与世界同行，可以接受差异，甚至不介意偶尔被误解，只是不必按照别人预设的方式出现。",
  "所谓少数，不一定关乎人数。它也可以是一种无需证明的独一性。",
  "别人选择如何定义，自己选择如何前行。",
  "Minority of one."
 ],
 "lyrics": [
  "Everybody wanna name me, wanna frame me, wanna place me in a lane and make me stay",
  "Tryna tell me where I fit, which side I'm on, but every time they choose a side for me, I move away"
 ],
 "showRelatedWorks": false
} :{}),...(i===6?{
 "art": "/artwork/07-official.png",
 "artworkKind": "official",
 "description": "Dark House × Slap House × Brazilian Bass",
 "audio": "/audio/almost-there.mp3",
 "audioDuration": 320.600167,
 "origin": [
  "《Almost There》的创作始于对“抵达”这一概念的重新理解。Destination 既可以指向空间中的终点，也可以成为欲望、亲密与感官体验的隐喻。当抵达不再对应某个明确的地点，“几乎到达”便形成了一种独立的情绪状态：距离不断缩短，真正被期待的时刻却始终留在下一秒。",
  "作品以简短、重复的英文 Hook 建立持续推进的节奏，通过催促、等待与短暂的停顿，让接近和延迟同时发生。歌词没有明确交代旅程的起点、终点或人物关系，使空间移动与感官暗示始终保持双重解释。",
  "音乐采用深色 House 与 Slap House、Brazilian Bass 的融合方向，以持续运动的低频、紧凑的电子律动和逐渐累积的张力，构建一种不断逼近临界点的听觉体验。歌曲最终停留在尚未完成的“Almost”，将原本应该得到释放的期待，留在了最后一个瞬间。"
 ],
 "interpretation": [
  "速度把街灯甩在身后，车厢里的时间却被拉得很慢。膝盖偶然相抵，没有人退开。指尖若有似无地碰过手背，目光交换得比话语更频繁。分明还隔着一小段距离，空气已经先热了起来。",
  "真正让人失去耐心的，往往不是亲吻，而是吻落下之前。目光从眼睛滑向嘴唇，呼吸逐渐交错，腰侧的掌心稍稍收紧。近到连彼此的体温都能感知，却偏偏停在最后一寸。",
  "别停。",
  "再近一点。",
  "还不行。",
  "明明都知道这场暧昧要通往哪里，却默契地放慢每一个动作。一次故意错开的吻，一句贴着耳边的催促，连短暂的退让都像另一种邀请。越是迟迟不肯兑现，欲望就越有耐心地折磨着彼此。",
  "灯光飞退，低音逼近。那些反复的试探终于将距离缩短到几乎不存在。",
  "而最后一个吻，依然悬在半空。",
  "Almost."
 ],
 "lyricGroups": [
  [
   "Almost there",
   "Don't stop now"
  ],
  [
   "Almost there",
   "Not yet",
   "Take me there"
  ],
  [
   "Almost."
  ]
 ],
 "showRelatedWorks": false
} :{}),...(i===7?{
 art:"/artwork/08-official.jpg", artworkKind:"official" as const,
 "description": "Cinematic Neo-Soul × Chamber Pop",
 "dedication": {
  "label": "A SONG FOR TWO FRIENDS",
  "text": "献给 Henry 与 Ava 的求婚纪念"
 },
 "audio": "/audio/a-violet-afterglow.mp3",
 "audioDuration": 288.0135,
 "albumId": "ava",
 "origin": [
  "《A Violet Afterglow》是一首专门为两位朋友的求婚而创作的纪念歌曲。",
  "创作缘起于 Henry 为 Ava 筹备的巴黎求婚。2026 年 9 月 28 日，一个原本平凡的星期一，被赋予了特殊的意义。作品将巴黎黄昏、埃菲尔铁塔的金色余晖，以及两人计划前往的尼斯编织进歌词，使这首歌不仅承载一份爱情宣言，也保留了属于他们的时间与地点。",
  "歌曲主要从 Henry 的情感视角展开，以“Would a lifetime do?”回应关于未来的承诺。歌名《A Violet Afterglow》则通过三个词的首字母悄然组成 AVA，让被求婚者的名字成为作品中一处私密而温柔的设计。",
  "音乐选择 Cinematic Neo-Soul 与 Chamber Pop 的融合方向，以舒缓的节奏、温暖的器乐层次与富有电影感的情绪推进，为这场求婚赋予一段可以被反复聆听的记忆。",
  "不同于以个人经历为中心的创作，这首作品的意义首先来自一份赠予：创作者并非故事中的求婚者，而是以音乐为两位朋友保存一个重要的人生时刻。"
 ],
 "interpretation": [
  "世界上有无数个星期一，大多数安静地经过，消失在日历的背面。只有极少数，会因为一句话，被两个人记住一生。",
  "巴黎的黄昏落在露台与屋顶之间，铁塔渐渐染上金色。城市仍循着自己的节奏运转，而有些人的未来，正在这一刻悄然改变。",
  "爱情有时并不需要更加盛大的语言。比起许诺永恒，或许更动人的是认真地问一句：如果用一生来回答，够不够？",
  "这首歌写给两位朋友，也写给那个值得被珍藏的时刻。未能亲临的祝福，被折进旋律与余晖，让一段属于他们的记忆，从此拥有可以再次抵达的声音。",
  "愿那个在黄昏里被问出的问题，往后每一年，都能得到新的回答。",
  "愿漫长的后来，比那一天更加美好。"
 ],
 "lyricGroups": [
  [
   "Forever chose a Monday",
   "A violet afterglow",
   "The Eiffel Tower turning gold",
   "With Paris down below"
  ],
  [
   "Would a lifetime do?"
  ]
 ],
 "showRelatedWorks": false
} :{}),...(i===8?{
 "art": "/artwork/09-official.png",
 "artworkKind": "official",
 "description": "Chinese Neo-Classical Slow Rave × Deep Progressive Pop",
 "audio": "/audio/meng-bu-shi-ren-lao.mp3",
 "audioDuration": 259.9735,
 "albumId": "gewai",
 "origin": [
  "《梦不识人老》围绕梦境与现实之间不对等的时间感展开：人在岁月中不断向前，而梦中的景物、关系与旧日片刻，却仿佛不曾意识到时间的流逝。",
  "创作以桥、月、潮汐、亭皋等古典意象构建叙事空间，通过自然景物的恒常与个体生命的变化形成对照。歌词没有直接讲述某段已经结束的往事，而是让梦境成为一个不受现实时间完全支配的所在，使怀念、失去与无法返回的过去，在景物的反复出现中逐渐显影。",
  "音乐选择 Chinese Neo-Classical Slow Rave 与 Deep Progressive Pop 的融合方向，以古典器乐的东方意境衔接现代电子音乐的渐进式律动，在传统语言与当代声音之间建立联系。作品最终并不试图让时间倒流，而是保留了那种独特的错位：梦仍停在旧日，人却已经走到后来。"
 ],
 "interpretation": [
  "月亮仍照着那座桥，潮水仍漫过旧日亭皋。山河似乎从未迟到，唯独人间，已经悄悄过了许多年。",
  "梦是很奇怪的故地。花开时不知后来会谢，相逢时也不问分别已有多久。旧日的人与景仍依照记忆里的模样出现，连未说完的话，都像还来得及继续。",
  "只是梦不懂衰老，也不懂后来。",
  "那些在现实中逐渐远去的事物，在梦里依然可以触及。不是岁月真的停了下来，而是有些曾经，一旦被记住，便拥有了不必随时间一同改变的模样。",
  "人醒来时，天光已经换过许多次。",
  "桥还在，月还在。",
  "只是再走到桥上的人，已经不是当年的年岁。"
 ],
 "lyricGroups": [
  [
   "月还照着那座桥",
   "潮仍漫过旧亭皋"
  ],
  [
   "梦不识人老",
   "花谢都在梦外",
   "梦不识我老",
   "醒来才有后来"
  ]
 ],
 "showRelatedWorks": false
} :{})}));
// Stable ID 10 remains 红鸾. The new work has its own identity; display order is derived below.
songs.push({
 "id": 11,
 "title": "치킨아, 나를 부르지 마라",
 "featured": true,
 "core": false,
 "art": "/artwork/chikina-official.png",
 "artworkKind": "official",
 "accent": "#c9a072",
 "x": 91,
 "y": 80,
 "description": "1980s Korean Television Trot × Disco",
 "language": "韩语",
 "audio": "/audio/chikina.mp3",
 "audioDuration": 373.040167,
 "origin": [
  "《치킨아, 나를 부르지 마라》的创作源于一个颇为荒诞的设想：如果用八十年代韩国苦情歌曲的庄严姿态，去演唱一个减肥者与炸鸡之间反复失败的告别，会产生怎样的音乐效果？",
  "作品选择韩国复古 Trot 与 Disco 作为音乐基础，将郑重的情感表达与日常生活中微不足道的诱惑并置。歌词以韩语写作，先借由“그대”等带有情歌意味的称呼隐藏对象，再于副歌揭晓真正被呼唤的是炸鸡。随着故事推进，拒绝逐渐变成自我说服，最终在看似决绝的宣言中，迎来一次令人会心的妥协。",
  "清凉里、半半炸鸡等细节也被保留在作品中，作为真实生活记忆的轻微回声，但并不承担明确的情感叙事。音乐则始终维持复古韩国电视舞台的热烈与认真，以铜管、手风琴和 Disco 律动，为这场荒诞的“悲恋”赋予近乎隆重的仪式感。",
  "作品并不试图嘲讽爱情歌曲，而是借用其成熟的情感语言，让普通生活中的欲望、克制与自我妥协，获得一次幽默而郑重的表达。"
 ],
 "interpretation": [
  "世上有些告别，需要很大的决心。",
  "譬如某个深夜，郑重地向一段无法继续的关系宣告：从今往后，不必再来寻找彼此。",
  "那位令人念念不忘的“你”，却总在最不合时宜的时候出现。隔着一条街，也能辨认出熟悉的气息；明明已经下定决心，仍忍不住多停留片刻。情到深处，连拒绝都显得格外悲壮。",
  "只是闻一闻，应该不算违背誓言。",
  "零度可乐已经打开，也不过是恰好有些口渴。",
  "旧日的清凉里，偶尔还会从一句歌里经过。那是另一段时间留下的味道，不必细说，也不妨碍今夜继续与自己较量。",
  "直到门铃响起。",
  "那些关于克制与决绝的豪言壮语，终于在一项简单而现实的选择面前败下阵来。",
  "原味一半。",
  "酱油一半。",
  "至于明天是否继续减肥——",
  "明天再说。"
 ],
 "lyricGroups": [
  [
   "치킨아——",
   "나를 부르지 마라"
  ],
  [
   "냄새만 맡는 건 괜찮겠지",
   "제로 콜라는 벌써 열려 있네"
  ],
  [
   "후라이드 반…",
   "간장 반."
  ]
 ],
 "showRelatedWorks": false
});
// Album assignments and non-featured order follow the user-provided list and exclusions.
const albumAssignments: Record<number,string> = {"12": "jinrisheng", "3": "jinrisheng", "14": "entropy", "11": "entropy", "16": "entropy", "4": "entropy", "17": "entropy", "2": "entropy", "7": "entropy", "18": "gewai", "6": "gewai", "19": "gewai", "20": "gewai", "21": "entropy", "22": "entropy", "23": "jinrisheng", "1": "jinrisheng", "24": "entropy", "8": "ava", "26": "entropy", "27": "jinrisheng", "28": "entropy", "29": "jinrisheng", "30": "jinrisheng", "31": "entropy", "32": "jinrisheng", "33": "entropy", "34": "entropy", "35": "entropy", "36": "gewai", "37": "gewai", "5": "gewai", "9": "gewai", "38": "entropy", "10": "gewai"};
for(const song of songs) song.albumId=albumAssignments[song.id]??song.albumId;
Object.assign(songs.find(song=>song.id===10)!,{"sourceOrder": 38, "previewStatus": "ready", "previewStart": 143.487, "preview": "/audio/previews/preview-10.mp3", "previewDuration": 30.0});
songs.push(...[
 {
  "id": 12,
  "title": "The Fire We Carry",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "jinrisheng",
  "sourceOrder": 1,
  "previewStatus": "ready",
  "previewStart": 133.221,
  "preview": "/audio/previews/preview-12.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 14,
  "title": "You don’t have to leave",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 4,
  "previewStatus": "ready",
  "previewStart": 65.048,
  "preview": "/audio/previews/preview-14.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 16,
  "title": "Neon Summer.exe",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 7,
  "previewStatus": "ready",
  "previewStart": 76.494,
  "preview": "/audio/previews/preview-16.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 17,
  "title": "빨간불엔 키스 금지",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 9,
  "previewStatus": "ready",
  "previewStart": 57.926,
  "preview": "/audio/previews/preview-17.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 18,
  "title": "红艳",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "gewai",
  "sourceOrder": 12,
  "previewStatus": "ready",
  "previewStart": 73.155,
  "preview": "/audio/previews/preview-18.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 19,
  "title": "FEED ME | 大耗",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "gewai",
  "sourceOrder": 14,
  "previewStatus": "ready",
  "previewStart": 173.344,
  "preview": "/audio/previews/preview-19.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 20,
  "title": "餘 | 咸池",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "gewai",
  "sourceOrder": 15,
  "previewStatus": "ready",
  "previewStart": 210.254,
  "preview": "/audio/previews/preview-20.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 21,
  "title": "过往逆生长",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 16,
  "previewStatus": "ready",
  "previewStart": 206.389,
  "preview": "/audio/previews/preview-21.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 22,
  "title": "祷",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 17,
  "previewStatus": "ready",
  "previewStart": 152.492,
  "preview": "/audio/previews/preview-22.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 23,
  "title": "尾生",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "jinrisheng",
  "sourceOrder": 18,
  "previewStatus": "ready",
  "previewStart": 69.893,
  "preview": "/audio/previews/preview-23.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 24,
  "title": "不识边界",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 20,
  "previewStatus": "ready",
  "previewStart": 139.244,
  "preview": "/audio/previews/preview-24.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 26,
  "title": "行咗先算",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 23,
  "previewStatus": "ready",
  "previewStart": 41.089,
  "preview": "/audio/previews/preview-26.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 27,
  "title": "The Same Ocean (万物同潮)",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "jinrisheng",
  "sourceOrder": 24,
  "previewStatus": "ready",
  "previewStart": 75.309,
  "preview": "/audio/previews/preview-27.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 28,
  "title": "반 박자",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 25,
  "previewStatus": "ready",
  "previewStart": 68.331,
  "preview": "/audio/previews/preview-28.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 29,
  "title": "Past Due",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "jinrisheng",
  "sourceOrder": 26,
  "previewStatus": "ready",
  "previewStart": 127.83,
  "preview": "/audio/previews/preview-29.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 30,
  "title": "Metformin",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "jinrisheng",
  "sourceOrder": 27,
  "previewStatus": "ready",
  "previewStart": 87.268,
  "preview": "/audio/previews/preview-30.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 31,
  "title": "借りた明日",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 28,
  "previewStatus": "ready",
  "previewStart": 71.095,
  "preview": "/audio/previews/preview-31.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 32,
  "title": "好多晚",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "jinrisheng",
  "sourceOrder": 29,
  "previewStatus": "ready",
  "previewStart": 141.562,
  "preview": "/audio/previews/preview-32.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 33,
  "title": "Das erste Zeichen",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 30,
  "previewStatus": "ready",
  "previewStart": 235.37,
  "preview": "/audio/previews/preview-33.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 34,
  "title": "Hives",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 31,
  "previewStatus": "ready",
  "previewStart": 148.342,
  "preview": "/audio/previews/preview-34.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 35,
  "title": "Thgir, right, wr0ng",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 32,
  "previewStatus": "ready",
  "previewStart": 141.078,
  "preview": "/audio/previews/preview-35.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 36,
  "title": "驿马",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "gewai",
  "sourceOrder": 33,
  "previewStatus": "ready",
  "previewStart": 182.522,
  "preview": "/audio/previews/preview-36.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 37,
  "title": "영감 중독 | 十灵",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "gewai",
  "sourceOrder": 34,
  "previewStatus": "ready",
  "previewStart": 172.246,
  "preview": "/audio/previews/preview-37.mp3",
  "previewDuration": 30.0
 },
 {
  "id": 38,
  "title": "失重",
  "featured": false,
  "core": false,
  "description": "",
  "accent": "#a4c8d7",
  "x": 0,
  "y": 0,
  "albumId": "entropy",
  "sourceOrder": 37,
  "previewStatus": "ready",
  "previewStart": 153.583,
  "preview": "/audio/previews/preview-38.mp3",
  "previewDuration": 30.0
 }
] as Song[]);
export const albums: Album[] = [{id:'gewai',title:'格外',songIds:[]},{id:'ava',title:'ava',songIds:[]},{id:'jinrisheng',title:'今日生',songIds:[]},{id:'entropy',title:'ENTROPY',songIds:[]}];
for(const album of albums) album.songIds=songs.filter(song=>song.albumId===album.id).map(song=>song.id);
export const otherSongs = songs.filter(song=>!song.featured).sort((a,b)=>(a.sourceOrder??Infinity)-(b.sourceOrder??Infinity));
export const featuredSongs = songs.filter(song=>song.featured);
// A display position is never a song identity or route key.
export const featuredNumber = (id:number)=>{const index=featuredSongs.findIndex(song=>song.id===id);return index<0?undefined:index+1};
export const songById = (id:number)=>songs.find(song=>song.id===id);
export const albumById = (id?:string)=>albums.find(album=>album.id===id);
export function officialUrl(value?:string) {
 if(!value)return undefined;
 try {const url=new URL(value);return url.protocol==='https:'?url.href:undefined} catch {return undefined}
}
