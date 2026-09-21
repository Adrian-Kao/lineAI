import { useEffect, useState } from 'react'
import './matchThreeGame.css'

const BOARD_SIZE = 8
const TARGET_SCORE = 1200

const TYPES = ['woodenFish', 'talisman', 'moonCup']

const TYPE_NAMES = {
  woodenFish: '木魚',
  talisman: '平安符',
  moonCup: '擲筊',
}

function createPiece(type = randomType()) {
  return {
    id: crypto.randomUUID(),
    type,
    special: null,
  }
}

function randomType() {
  return TYPES[Math.floor(Math.random() * TYPES.length)]
}

function createBoard() {
  return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => createPiece())
}

function swap(board, first, second) {
  const next = [...board]
  ;[next[first], next[second]] = [next[second], next[first]]
  return next
}

function getRow(index) {
  return Math.floor(index / BOARD_SIZE)
}

function getColumn(index) {
  return index % BOARD_SIZE
}

function isAdjacent(first, second) {
  const rowDifference = Math.abs(getRow(first) - getRow(second))
  const columnDifference = Math.abs(getColumn(first) - getColumn(second))

  return rowDifference + columnDifference === 1
}

function findMatches(board) {
  const matched = new Set()
  const groups = []

  // 檢查橫向連線
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    let start = 0

    while (start < BOARD_SIZE) {
      const index = row * BOARD_SIZE + start
      const type = board[index].type
      let end = start + 1

      while (
        end < BOARD_SIZE &&
        board[row * BOARD_SIZE + end].type === type
      ) {
        end += 1
      }

      if (end - start >= 3) {
        const group = []

        for (let column = start; column < end; column += 1) {
          const matchIndex = row * BOARD_SIZE + column
          matched.add(matchIndex)
          group.push(matchIndex)
        }

        groups.push(group)
      }

      start = end
    }
  }

  // 檢查直向連線
  for (let column = 0; column < BOARD_SIZE; column += 1) {
    let start = 0

    while (start < BOARD_SIZE) {
      const index = start * BOARD_SIZE + column
      const type = board[index].type
      let end = start + 1

      while (
        end < BOARD_SIZE &&
        board[end * BOARD_SIZE + column].type === type
      ) {
        end += 1
      }

      if (end - start >= 3) {
        const group = []

        for (let row = start; row < end; row += 1) {
          const matchIndex = row * BOARD_SIZE + column
          matched.add(matchIndex)
          group.push(matchIndex)
        }

        groups.push(group)
      }

      start = end
    }
  }

  return { matched, groups }
}

function getSpecials(groups, board, preferredIndex) {
  const specials = new Map()

  groups.forEach((group) => {
    if (group.length < 4) return

    const specialIndex = group.includes(preferredIndex)
      ? preferredIndex
      : group[Math.floor(group.length / 2)]

    specials.set(specialIndex, {
      type: board[group[0]].type,
      special: group.length >= 5 ? 'incenseBurner' : 'goldenCup',
    })
  })

  return specials
}

function applyGravity(board) {
  const next = [...board]

  for (let column = 0; column < BOARD_SIZE; column += 1) {
    const remaining = []

    for (let row = BOARD_SIZE - 1; row >= 0; row -= 1) {
      const index = row * BOARD_SIZE + column
      if (next[index]) remaining.push(next[index])
    }

    for (let row = BOARD_SIZE - 1; row >= 0; row -= 1) {
      const index = row * BOARD_SIZE + column
      next[index] = remaining.shift() ?? createPiece()
    }
  }

  return next
}

function resolveMatches(board, preferredIndex) {
  let nextBoard = [...board]
  let totalRemoved = 0
  let currentPreferredIndex = preferredIndex

  for (let chain = 0; chain < 20; chain += 1) {
    const { matched, groups } = findMatches(nextBoard)

    if (matched.size === 0) break

    const specials = getSpecials(groups, nextBoard, currentPreferredIndex)
    const clearedBoard = [...nextBoard]

    matched.forEach((index) => {
      clearedBoard[index] = null
    })

    specials.forEach((piece, index) => {
      clearedBoard[index] = {
        id: crypto.randomUUID(),
        type: piece.type,
        special: piece.special,
      }
    })

    totalRemoved += matched.size
    nextBoard = applyGravity(clearedBoard)
    currentPreferredIndex = -1
  }

  return {
    board: nextBoard,
    removed: totalRemoved,
  }
}

function activateSpecials(board, first, second) {
  const nextBoard = swap(board, first, second)
  const firstPiece = nextBoard[first]
  const secondPiece = nextBoard[second]
  const toRemove = new Set()

  function explode(centerIndex) {
    const centerRow = getRow(centerIndex)
    const centerColumn = getColumn(centerIndex)

    for (let row = centerRow - 1; row <= centerRow + 1; row += 1) {
      for (let column = centerColumn - 1; column <= centerColumn + 1; column += 1) {
        if (
          row >= 0 &&
          row < BOARD_SIZE &&
          column >= 0 &&
          column < BOARD_SIZE
        ) {
          toRemove.add(row * BOARD_SIZE + column)
        }
      }
    }
  }

  function removeSameColor(color) {
    nextBoard.forEach((piece, index) => {
      if (piece.type === color) toRemove.add(index)
    })
  }

  const pieces = [
    { piece: firstPiece, index: first, other: secondPiece },
    { piece: secondPiece, index: second, other: firstPiece },
  ]

  pieces.forEach(({ piece, index, other }) => {
    if (piece.special === 'goldenCup') {
      explode(index)
    }

    if (piece.special === 'incenseBurner') {
      removeSameColor(other.type)
      toRemove.add(index)
    }
  })

  if (toRemove.size === 0) return null

  toRemove.forEach((index) => {
    nextBoard[index] = null
  })

  const fallenBoard = applyGravity(nextBoard)
  const result = resolveMatches(fallenBoard, -1)

  return {
    board: result.board,
    removed: toRemove.size + result.removed,
  }
}

function hasPossibleMove(board) {
  if (board.some((piece) => piece.special)) return true

  for (let index = 0; index < board.length; index += 1) {
    const right = index + 1
    const down = index + BOARD_SIZE

    const possibleMoves = []

    if (getColumn(index) < BOARD_SIZE - 1) possibleMoves.push(right)
    if (getRow(index) < BOARD_SIZE - 1) possibleMoves.push(down)

    if (
      possibleMoves.some((target) => {
        const result = findMatches(swap(board, index, target))
        return result.matched.size > 0
      })
    ) {
      return true
    }
  }

  return false
}

function createPlayableBoard() {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const board = createBoard()

    if (findMatches(board).matched.size === 0 && hasPossibleMove(board)) {
      return board
    }
  }

  return createBoard()
}

function PieceIcon({ piece }) {
  if (piece.special === 'goldenCup') {
    return <span className="match3-piece__golden">金筊</span>
  }

  if (piece.special === 'incenseBurner') {
    return <span className="match3-piece__burner">鼎</span>
  }

  if (piece.type === 'woodenFish') {
    return <span className="match3-piece__wooden-fish">木魚</span>
  }

  if (piece.type === 'talisman') {
    return <span className="match3-piece__talisman">平安</span>
  }

  return <span className="match3-piece__moon-cup">☽</span>
}

export default function MatchThreeGame({
  targetScore = TARGET_SCORE,
  onComplete,
}) {
  const [board, setBoard] = useState(createPlayableBoard)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('交換相鄰棋子，連成三個以上即可消除。')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (isComplete || hasPossibleMove(board)) return

    setBoard(createPlayableBoard())
    setSelectedIndex(null)
    setMessage('沒有可交換的棋子，已自動洗牌。')
  }, [board, isComplete])

  function finishGame(nextScore) {
    if (nextScore < targetScore || isComplete) return

    setIsComplete(true)
    setMessage('過關！功德圓滿，成功完成消消樂挑戰。')

    onComplete?.({
      taskId: 'match-three',
      completedAt: new Date().toISOString(),
      evidence: {
        kind: 'match-three',
        score: nextScore,
      },
    })
  }

  function handleTileClick(index) {
    if (isComplete) return

    if (selectedIndex === null) {
      setSelectedIndex(index)
      setMessage('請再選擇相鄰的棋子交換。')
      return
    }

    if (selectedIndex === index) {
      setSelectedIndex(null)
      setMessage('已取消選擇。')
      return
    }

    if (!isAdjacent(selectedIndex, index)) {
      setSelectedIndex(index)
      setMessage('只能交換相鄰棋子。')
      return
    }

    const specialResult = activateSpecials(board, selectedIndex, index)
    const swappedBoard = swap(board, selectedIndex, index)
    const normalResult = resolveMatches(swappedBoard, index)

    if (!specialResult && normalResult.removed === 0) {
      setSelectedIndex(null)
      setMessage('這次交換無法消除，請換一組。')
      return
    }

    const result = specialResult ?? normalResult
    const addedScore = result.removed * 100
    const nextScore = score + addedScore

    setBoard(result.board)
    setSelectedIndex(null)
    setScore(nextScore)

    if (specialResult) {
      setMessage(`特殊消除成功！消除了 ${result.removed} 個元素。`)
    } else {
      setMessage(`消除了 ${result.removed} 個元素，獲得 ${addedScore} 分。`)
    }

    finishGame(nextScore)
  }

  function handleRestart() {
    setBoard(createPlayableBoard())
    setSelectedIndex(null)
    setScore(0)
    setIsComplete(false)
    setMessage('新的棋盤已生成，開始挑戰吧！')
  }

  return (
    <section className="match3-game" aria-labelledby="match3-title">
      <header className="match3-game__header">
        <p className="match3-game__eyebrow">祈福消消樂</p>
        <h2 id="match3-title">功德配對挑戰</h2>
        <p>目標分數：{targetScore} 分</p>
      </header>

      <div className="match3-game__score">
        <span>目前分數</span>
        <strong>{score}</strong>
      </div>

      <div className="match3-game__board" role="grid" aria-label="消消樂棋盤">
        {board.map((piece, index) => (
          <button
            className={[
              'match3-game__tile',
              `is-${piece.type}`,
              piece.special ? `is-${piece.special}` : '',
              selectedIndex === index ? 'is-selected' : '',
            ].join(' ')}
            key={piece.id}
            type="button"
            onClick={() => handleTileClick(index)}
            aria-label={`${TYPE_NAMES[piece.type]}${piece.special ? '特殊棋子' : ''}`}
            aria-pressed={selectedIndex === index}
            disabled={isComplete}
          >
            <PieceIcon piece={piece} />
          </button>
        ))}
      </div>

      <div className="match3-game__legend">
        <span>木魚</span>
        <span>平安符</span>
        <span>擲筊</span>
        <span>金筊：3×3 爆破</span>
        <span>香火鼎：消除同色</span>
      </div>

      <p className="match3-game__message" aria-live="polite">
        {message}
      </p>

      {isComplete && (
        <button
          className="match3-game__restart"
          type="button"
          onClick={handleRestart}
        >
          再玩一次
        </button>
      )}
    </section>
  )
}