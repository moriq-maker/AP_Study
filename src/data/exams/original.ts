import type { Exam, Question } from '../types';

export const EXAM: Exam = {
  id: 'original',
  title: 'オリジナル問題',
  order: 0,
};

/** 試験形式に倣ったオリジナル問題 */
export const QUESTIONS: Question[] = [
  // ---------------- テクノロジ系 ----------------
  {
    id: 't-basic-001',
    examId: 'original',
    field: 'technology',
    category: '基礎理論',
    question: '2進数 0.1101 を10進数で表したものはどれか。',
    choices: ['0.8125', '0.625', '0.75', '0.875'],
    answer: 0,
    explanation: '0.1101(2) = 1/2 + 1/4 + 0/8 + 1/16 = 0.5 + 0.25 + 0.0625 = 0.8125。',
  },
  {
    id: 't-basic-002',
    examId: 'original',
    field: 'technology',
    category: '基礎理論',
    question: '8ビットの2の補数表現で表すことができる整数の範囲はどれか。',
    choices: ['−127 〜 127', '−127 〜 128', '−128 〜 127', '0 〜 255'],
    answer: 2,
    explanation:
      'nビットの2の補数表現の範囲は −2^(n−1) 〜 2^(n−1)−1。8ビットなら −128 〜 127。0 〜 255 は符号なし整数の範囲。',
  },
  {
    id: 't-basic-003',
    examId: 'original',
    field: 'technology',
    category: '基礎理論',
    question: '論理式 A・B + A・¬B と等価なものはどれか。ここで、・は論理積、+ は論理和、¬ は否定を表す。',
    choices: ['A', 'B', 'A・B', 'A + B'],
    answer: 0,
    explanation: 'A・B + A・¬B = A・(B + ¬B) = A・1 = A。',
  },
  {
    id: 't-basic-004',
    examId: 'original',
    field: 'technology',
    category: '基礎理論',
    question:
      'M/M/1 の待ち行列モデルにおいて、窓口の利用率が 0.8 のとき、平均待ち時間は平均サービス時間の何倍か。',
    choices: ['0.8', '1.25', '4', '5'],
    answer: 2,
    explanation:
      'M/M/1 の平均待ち時間 = ρ / (1 − ρ) × 平均サービス時間。ρ = 0.8 なので 0.8 / 0.2 = 4 倍。なお、平均応答時間(待ち時間+サービス時間)は 1 / (1 − ρ) = 5 倍になる。',
  },
  {
    id: 't-algo-001',
    examId: 'original',
    field: 'technology',
    category: 'アルゴリズムとプログラミング',
    question: '昇順に整列された 1,000 個の要素からなる配列を二分探索するとき、最大の比較回数はどれか。',
    choices: ['10', '32', '500', '1,000'],
    answer: 0,
    explanation:
      '二分探索の最大比較回数はおよそ ⌊log₂N⌋ + 1。2^9 = 512 < 1,000 < 1,024 = 2^10 なので最大 10 回。',
  },
  {
    id: 't-algo-002',
    examId: 'original',
    field: 'technology',
    category: 'アルゴリズムとプログラミング',
    question:
      '空のスタックに対して、push 1, push 2, push 3, pop, push 4, pop, pop の順に操作を行った。pop で取り出された値を順に並べたものはどれか。',
    choices: ['3, 4, 2', '3, 4, 1', '1, 2, 4', '3, 2, 1'],
    answer: 0,
    explanation:
      'スタックは後入れ先出し(LIFO)。[1,2,3] から pop → 3、push 4 で [1,2,4]、pop → 4、pop → 2。よって 3, 4, 2。',
  },
  {
    id: 't-algo-003',
    examId: 'original',
    field: 'technology',
    category: 'アルゴリズムとプログラミング',
    question: '要素数 n のデータを整列するとき、最悪時の計算量が O(n log n) である整列アルゴリズムはどれか。',
    choices: ['クイックソート', 'バブルソート', 'ヒープソート', '挿入ソート'],
    answer: 2,
    explanation:
      'ヒープソートは最悪時も O(n log n)。クイックソートは平均 O(n log n) だが最悪 O(n²)。バブルソートと挿入ソートは最悪 O(n²)。',
  },
  {
    id: 't-comp-001',
    examId: 'original',
    field: 'technology',
    category: 'コンピュータ構成要素',
    question:
      'キャッシュメモリのアクセス時間が 10 ナノ秒、主記憶のアクセス時間が 60 ナノ秒、キャッシュのヒット率が 90% のとき、実効アクセス時間は何ナノ秒か。',
    choices: ['13', '15', '35', '55'],
    answer: 1,
    explanation: '実効アクセス時間 = 0.9 × 10 + (1 − 0.9) × 60 = 9 + 6 = 15 ナノ秒。',
  },
  {
    id: 't-comp-002',
    examId: 'original',
    field: 'technology',
    category: 'コンピュータ構成要素',
    question: 'クロック周波数 1 GHz のプロセッサで、1 命令の実行に平均 4 クロックを要するとき、このプロセッサの性能は何 MIPS か。',
    choices: ['4', '25', '250', '4,000'],
    answer: 2,
    explanation: '1 秒間のクロック数 1,000 × 10⁶ を CPI 4 で割ると 250 × 10⁶ 命令/秒 = 250 MIPS。',
  },
  {
    id: 't-sys-001',
    examId: 'original',
    field: 'technology',
    category: 'システム構成要素',
    question: '稼働率 0.9 の装置を 2 台並列に接続したシステムがある。いずれか 1 台が稼働していればシステムは稼働しているとみなすとき、システムの稼働率はどれか。',
    choices: ['0.81', '0.90', '0.95', '0.99'],
    answer: 3,
    explanation: '並列システムの稼働率 = 1 − (1 − 0.9) × (1 − 0.9) = 1 − 0.01 = 0.99。直列なら 0.9 × 0.9 = 0.81。',
  },
  {
    id: 't-sys-002',
    examId: 'original',
    field: 'technology',
    category: 'システム構成要素',
    question: 'MTBF が 480 時間、MTTR が 20 時間の装置の稼働率はどれか。',
    choices: ['0.04', '0.92', '0.96', '0.98'],
    answer: 2,
    explanation: '稼働率 = MTBF / (MTBF + MTTR) = 480 / 500 = 0.96。',
  },
  {
    id: 't-sw-001',
    examId: 'original',
    field: 'technology',
    category: 'ソフトウェア',
    question: '仮想記憶のページ置換アルゴリズムである LRU の説明はどれか。',
    choices: [
      '最も古くに主記憶に読み込まれたページを置き換える。',
      '参照された回数が最も少ないページを置き換える。',
      '最後に参照されてから最も長い時間が経過したページを置き換える。',
      '今後最も長い間参照されないページを置き換える。',
    ],
    answer: 2,
    explanation:
      'LRU(Least Recently Used)は最後の参照からの経過時間が最も長いページを追い出す。アは FIFO、イは LFU、エは理論上の最適アルゴリズム(OPT)。',
  },
  {
    id: 't-sw-002',
    examId: 'original',
    field: 'technology',
    category: 'ソフトウェア',
    question: 'リエントラントプログラムの特徴はどれか。',
    choices: [
      '実行中に自分自身を呼び出すことができる。',
      '主記憶上のどこにロードしても実行することができる。',
      '複数のタスクから同時に呼び出されても、それぞれに正しい結果を返すことができる。',
      '一度ロードすれば、再ロードせずに繰り返し実行できるが、同時実行はできない。',
    ],
    answer: 2,
    explanation:
      'リエントラント(再入可能)プログラムは、データ部をタスクごとに分けることで同時実行を可能にする。アは再帰的、イは再配置可能(リロケータブル)、エは再使用可能(リユーザブル)の説明。',
  },
  {
    id: 't-db-001',
    examId: 'original',
    field: 'technology',
    category: 'データベース',
    question: '関係データベースの第3正規形の説明として、適切なものはどれか。',
    choices: [
      'すべての属性が単一の値をもち、繰返し項目がない。',
      '第1正規形であり、すべての非キー属性が主キーに完全関数従属している。',
      '第2正規形であり、すべての非キー属性が主キーに推移的関数従属していない。',
      'すべての属性が主キーの一部である。',
    ],
    answer: 2,
    explanation:
      '第3正規形は、第2正規形を満たした上で推移的関数従属(主キー → 非キー属性 → 別の非キー属性)を排除した状態。アは第1正規形、イは第2正規形の説明。',
  },
  {
    id: 't-db-002',
    examId: 'original',
    field: 'technology',
    category: 'データベース',
    question: 'トランザクションの ACID 特性のうち、同時に実行される複数のトランザクションが互いに干渉しないことを保証する性質はどれか。',
    choices: ['原子性(Atomicity)', '一貫性(Consistency)', '独立性(Isolation)', '耐久性(Durability)'],
    answer: 2,
    explanation:
      '独立性(隔離性)は、並行実行しても逐次実行した場合と同じ結果になることを保証する。原子性は「全部実行か全部取消し」、耐久性は「コミット結果が障害でも失われない」性質。',
  },
  {
    id: 't-db-003',
    examId: 'original',
    field: 'technology',
    category: 'データベース',
    question: '社員表(社員番号, 部門コード, 給与)から、平均給与が 500 以上の部門の部門コードを求める SQL 文はどれか。',
    choices: [
      'SELECT 部門コード FROM 社員 WHERE AVG(給与) >= 500 GROUP BY 部門コード',
      'SELECT 部門コード FROM 社員 GROUP BY 部門コード HAVING AVG(給与) >= 500',
      'SELECT 部門コード FROM 社員 GROUP BY 部門コード WHERE AVG(給与) >= 500',
      'SELECT 部門コード FROM 社員 HAVING AVG(給与) >= 500 ORDER BY 部門コード',
    ],
    answer: 1,
    explanation:
      'グループ化した結果に対する条件は HAVING 句で指定する。WHERE 句はグループ化前の行に対する条件で、集約関数は使えない。',
  },
  {
    id: 't-nw-001',
    examId: 'original',
    field: 'technology',
    category: 'ネットワーク',
    question: 'IPv4 で、サブネットマスクが /26 のネットワークに割り当てることができるホストアドレスの最大数はどれか。',
    choices: ['30', '62', '64', '126'],
    answer: 1,
    explanation:
      'ホスト部は 32 − 26 = 6 ビット。2⁶ = 64 からネットワークアドレスとブロードキャストアドレスの 2 個を除いて 62。',
  },
  {
    id: 't-nw-002',
    examId: 'original',
    field: 'technology',
    category: 'ネットワーク',
    question: 'OSI 基本参照モデルのトランスポート層で動作するプロトコルはどれか。',
    choices: ['IP', 'TCP', 'HTTP', 'ICMP'],
    answer: 1,
    explanation: 'TCP と UDP はトランスポート層。IP と ICMP はネットワーク層、HTTP はアプリケーション層のプロトコル。',
  },
  {
    id: 't-nw-003',
    examId: 'original',
    field: 'technology',
    category: 'ネットワーク',
    question: '伝送速度 100 M ビット/秒の回線で、1 M バイトのファイルを転送するのに要する時間は何秒か。ここで、回線の伝送効率は 80% とし、1 M バイト = 10⁶ バイトとする。',
    choices: ['0.01', '0.08', '0.1', '0.8'],
    answer: 2,
    explanation: '1 M バイト = 8 M ビット。実効速度は 100 × 0.8 = 80 M ビット/秒。8 / 80 = 0.1 秒。',
  },
  {
    id: 't-sec-001',
    examId: 'original',
    field: 'technology',
    category: 'セキュリティ',
    question: '公開鍵暗号方式を用いたデジタル署名において、署名の生成と検証に用いる鍵の組合せとして適切なものはどれか。',
    choices: [
      '署名生成: 送信者の公開鍵 / 検証: 送信者の秘密鍵',
      '署名生成: 送信者の秘密鍵 / 検証: 送信者の公開鍵',
      '署名生成: 受信者の公開鍵 / 検証: 受信者の秘密鍵',
      '署名生成: 受信者の秘密鍵 / 検証: 受信者の公開鍵',
    ],
    answer: 1,
    explanation:
      '送信者は自分の秘密鍵で署名し、受信者は送信者の公開鍵で検証する。秘密鍵を持つのは送信者本人だけなので、本人性と改ざんの有無を確認できる。',
  },
  {
    id: 't-sec-002',
    examId: 'original',
    field: 'technology',
    category: 'セキュリティ',
    question: 'SQL インジェクション攻撃への対策として、最も有効なものはどれか。',
    choices: [
      'Web サーバとデータベースサーバの間の通信を TLS で暗号化する。',
      'SQL 文の組立てにプレースホルダ(バインド機構)を使用する。',
      'Web ページの出力時に HTML の特殊文字をエスケープする。',
      'Cookie に HttpOnly 属性を付与する。',
    ],
    answer: 1,
    explanation:
      'プレースホルダを使うと入力値が SQL 文の構造として解釈されなくなる。ウとエは主にクロスサイトスクリプティング(XSS)への対策。',
  },
  {
    id: 't-sec-003',
    examId: 'original',
    field: 'technology',
    category: 'セキュリティ',
    question: 'パスワードをハッシュ化して保存する際に、ソルトを付加する主な目的はどれか。',
    choices: [
      'ハッシュ値から元のパスワードを復号できるようにする。',
      'ハッシュ値の計算時間を短縮する。',
      '同じパスワードでも利用者ごとに異なるハッシュ値にし、事前計算した表を使う攻撃を困難にする。',
      'パスワードの文字数制限を緩和する。',
    ],
    answer: 2,
    explanation:
      'ソルトを付けると同一パスワードでもハッシュ値が異なるため、レインボーテーブルなどの事前計算による解析が困難になる。ハッシュは一方向関数であり復号はできない。',
  },
  {
    id: 't-dev-001',
    examId: 'original',
    field: 'technology',
    category: 'システム開発技術',
    question: 'ブラックボックステストのテストケース設計技法はどれか。',
    choices: ['命令網羅', '判定条件網羅', '同値分割', '条件網羅'],
    answer: 2,
    explanation:
      '同値分割と限界値分析はプログラムの内部構造を見ずに仕様から設計するブラックボックステスト技法。命令網羅・判定条件網羅・条件網羅はホワイトボックステストの網羅基準。',
  },
  {
    id: 't-dev-002',
    examId: 'original',
    field: 'technology',
    category: 'システム開発技術',
    question: 'モジュール強度(凝集度)が最も高いものはどれか。',
    choices: ['暗合的強度', '論理的強度', '機能的強度', '時間的強度'],
    answer: 2,
    explanation:
      'モジュール強度は高い順に、機能的 > 情報的 > 連絡的 > 手順的 > 時間的 > 論理的 > 暗合的。強度は高いほど望ましい。',
  },
  {
    id: 't-dev-003',
    examId: 'original',
    field: 'technology',
    category: 'ソフトウェア開発管理技術',
    question: 'スクラムにおいて、プロダクトバックログの項目の優先順位付けに責任をもつ役割はどれか。',
    choices: ['スクラムマスター', 'プロダクトオーナー', '開発者', 'ステークホルダー'],
    answer: 1,
    explanation:
      'プロダクトオーナーはプロダクトの価値を最大化する責任を負い、プロダクトバックログの管理と優先順位付けを行う。スクラムマスターはスクラムの理解と実践を支援する役割。',
  },

  // ---------------- マネジメント系 ----------------
  {
    id: 'm-pm-001',
    examId: 'original',
    field: 'management',
    category: 'プロジェクトマネジメント',
    question:
      'EVM(アーンドバリューマネジメント)で、ある時点の PV が 100 万円、EV が 80 万円、AC が 90 万円であった。この時点のプロジェクトの状況として適切なものはどれか。',
    choices: [
      'スケジュールは進んでおり、コストは予算内である。',
      'スケジュールは進んでいるが、コストは超過している。',
      'スケジュールは遅れているが、コストは予算内である。',
      'スケジュールは遅れており、コストも超過している。',
    ],
    answer: 3,
    explanation:
      'SV = EV − PV = −20(遅れ)、CV = EV − AC = −10(超過)。SPI = 0.8、CPI ≒ 0.89 といずれも 1 未満。',
  },
  {
    id: 'm-pm-002',
    examId: 'original',
    field: 'management',
    category: 'プロジェクトマネジメント',
    question:
      '作業 A(3 日)、B(5 日)は同時に開始できる。作業 C(4 日)は A の完了後に、作業 D(3 日)は B の完了後に開始できる。作業 E(3 日)は C と D の両方が完了した後に開始できる。プロジェクト全体の最短所要日数はどれか。',
    choices: ['9', '10', '11', '12'],
    answer: 2,
    explanation:
      '経路 A→C→E は 3 + 4 + 3 = 10 日、経路 B→D→E は 5 + 3 + 3 = 11 日。最長経路(クリティカルパス)B→D→E の 11 日が最短所要日数。',
  },
  {
    id: 'm-sm-001',
    examId: 'original',
    field: 'management',
    category: 'サービスマネジメント',
    question: 'IT サービスマネジメントにおけるインシデント管理の目的として、適切なものはどれか。',
    choices: [
      'インシデントの根本原因を特定し、再発を防止する。',
      '合意したサービスを可能な限り迅速に回復する。',
      'サービスの構成要素とその関係を正確に記録・維持する。',
      'サービスへの変更を、リスクを管理しながら実施する。',
    ],
    answer: 1,
    explanation:
      'インシデント管理はサービスの迅速な回復が目的。アは問題管理、ウは構成管理、エは変更管理の目的。',
  },
  {
    id: 'm-audit-001',
    examId: 'original',
    field: 'management',
    category: 'システム監査',
    question: 'システム監査人が監査意見を形成する際の根拠となるものはどれか。',
    choices: ['監査証拠', '被監査部門の要望', '監査人の経験則', '経営者の意向'],
    answer: 0,
    explanation:
      'システム監査人は、監査手続を実施して入手した十分かつ適切な監査証拠に基づいて監査意見を形成する。',
  },

  // ---------------- ストラテジ系 ----------------
  {
    id: 's-strat-001',
    examId: 'original',
    field: 'strategy',
    category: '経営戦略',
    question: 'PPM(プロダクトポートフォリオマネジメント)において、市場成長率が高く、相対的市場占有率も高い事業の分類はどれか。',
    choices: ['金のなる木', '問題児', '負け犬', '花形'],
    answer: 3,
    explanation:
      '花形: 高成長・高シェア。金のなる木: 低成長・高シェア。問題児: 高成長・低シェア。負け犬: 低成長・低シェア。',
  },
  {
    id: 's-biz-001',
    examId: 'original',
    field: 'strategy',
    category: '企業活動',
    question: '固定費が 400 万円、変動費率が 0.6 の製品の損益分岐点売上高は何万円か。',
    choices: ['240', '640', '1,000', '1,600'],
    answer: 2,
    explanation: '損益分岐点売上高 = 固定費 / (1 − 変動費率) = 400 / 0.4 = 1,000 万円。',
  },
  {
    id: 's-biz-002',
    examId: 'original',
    field: 'strategy',
    category: '企業活動',
    question: '品質管理において、不良の原因などを項目別に発生件数の多い順に並べた棒グラフと、その累積比率を示す折れ線グラフを組み合わせた図はどれか。',
    choices: ['管理図', '特性要因図', 'パレート図', '散布図'],
    answer: 2,
    explanation:
      'パレート図は重点的に対策すべき項目を見つけるのに使う(ABC 分析)。管理図は工程の異常検知、特性要因図は原因の洗い出し、散布図は 2 変数の相関の確認に使う。',
  },
  {
    id: 's-sys-001',
    examId: 'original',
    field: 'strategy',
    category: 'システム戦略',
    question: 'RPA(Robotic Process Automation)の説明として、適切なものはどれか。',
    choices: [
      '工場の生産ラインに産業用ロボットを導入し、組立作業を自動化する。',
      'PC 上で人が行っている定型的な事務作業を、ソフトウェアによって自動化する。',
      '業務プロセスを抜本的に見直し、組織構造や業務の流れを再設計する。',
      '業務システムの機能をサービスとして部品化し、組み合わせてシステムを構築する。',
    ],
    answer: 1,
    explanation:
      'RPA はソフトウェアロボットによる定型的なホワイトカラー業務の自動化。ウは BPR、エは SOA の説明。',
  },
  {
    id: 's-law-001',
    examId: 'original',
    field: 'strategy',
    category: '法務',
    question: '著作権法によって保護されるものはどれか。',
    choices: ['アルゴリズム', 'プログラム言語', 'インタフェースの規約', 'ソースプログラム'],
    answer: 3,
    explanation:
      '著作権法はプログラムの「表現」を保護する。プログラム言語、規約(インタフェースやプロトコル)、解法(アルゴリズム)は保護の対象外と明記されている。',
  },
  {
    id: 's-law-002',
    examId: 'original',
    field: 'strategy',
    category: '法務',
    question: '労働者派遣において、派遣労働者に対して業務上の指揮命令を行う者はどれか。',
    choices: ['派遣元事業主', '派遣先', '派遣労働者本人', '厚生労働大臣'],
    answer: 1,
    explanation:
      '労働者派遣では雇用関係は派遣元にあるが、指揮命令は派遣先が行う。請負契約では、発注者は請負事業者の労働者に直接指揮命令できない(偽装請負に注意)。',
  },
];
