import { useState } from 'react'
import { firstName, hasVoted, presentPerson, voteCount } from '@/lib/logic'
import { useFrame } from '@/state/frame'
import { useNav } from '@/state/nav'
import { useMe, useStore } from '@/state/store'
import { Avatar, Icon, Segmented } from '@/components/ui'

const PANES = [
  { id: 'qa' as const, label: 'Q&A' },
  { id: 'wall' as const, label: 'Commitments' },
  { id: 'feedback' as const, label: 'Feedback' },
]

const SORTS = [
  { id: 'top' as const, label: 'Top' },
  { id: 'newest' as const, label: 'Newest' },
  { id: 'mine' as const, label: 'Mine' },
  { id: 'answered' as const, label: 'Answered' },
]

export function Ask() {
  const nav = useNav()
  const frame = useFrame()
  const { state } = useStore()
  const pane = state.event.feedbackOpen || nav.askPane !== 'feedback' ? nav.askPane : 'qa'

  return (
    <div className={frame === 'phone' ? 'px-4 pb-4' : 'mx-auto w-full max-w-5xl px-8 pb-8'}>
      <div className="pb-3">
        <h1 className="text-[1.7rem] font-semibold tracking-tight">Participate</h1>
        <p className="mt-0.5 text-sm text-muted">Ask questions, share a commitment, and rate the day.</p>
      </div>
      <div
        className="sticky z-20 -mx-4 bg-cream/95 px-4 pb-3 backdrop-blur-md md:-mx-8 md:px-8"
        style={{ top: frame === 'phone' ? 'calc(3.5rem + env(safe-area-inset-top))' : 0 }}
      >
        <Segmented
          options={state.event.feedbackOpen ? PANES : PANES.filter((item) => item.id !== 'feedback')}
          value={pane}
          onChange={(ask) => nav.setTab('ask', { ask })}
        />
      </div>
      {pane === 'qa' ? <Questions /> : null}
      {pane === 'wall' ? <CommitmentWall /> : null}
      {pane === 'feedback' ? <FeedbackForm /> : null}
    </div>
  )
}

function Questions() {
  const { state, dispatch } = useStore()
  const { me } = useMe()
  const [text, setText] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [sort, setSort] = useState<(typeof SORTS)[number]['id']>('top')
  const [openId, setOpenId] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const visible = state.questions.filter((question) => me.isOrganizer || !question.isHidden)
  const counts = {
    top: visible.length,
    newest: visible.length,
    mine: visible.filter((question) => question.authorId === me.id).length,
    answered: visible.filter((question) => question.isAnswered).length,
  }
  const questions = visible
    .filter((question) => {
      if (sort === 'mine') return question.authorId === me.id
      if (sort === 'answered') return question.isAnswered
      return true
    })
    .slice()
    .sort((a, b) => {
      if (sort === 'newest') return b.createdAt.localeCompare(a.createdAt)
      if (sort === 'top') return voteCount(state, b.id) - voteCount(state, a.id)
      return b.createdAt.localeCompare(a.createdAt)
    })

  return (
    <div>
      {state.event.questionsOpen ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            dispatch({ type: 'postQuestion', text, anonymous })
            setText('')
          }}
          className="rounded-3xl bg-paper p-3 ring-2 ring-green"
        >
          <div className="flex items-center gap-2 px-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-green text-ink">
              <Icon name="message" className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">Ask a question</span>
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Your question for the leadership team"
            rows={2}
            maxLength={280}
            className="mt-2 w-full resize-none bg-transparent px-2 py-1 outline-none placeholder:text-muted/70"
          />
          <div className="mt-1 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setAnonymous((value) => !value)} className="text-sm font-medium text-muted">
              <span className={`mr-2 inline-block h-4 w-4 rounded-full border align-[-3px] ${anonymous ? 'border-ink bg-green' : 'border-line'}`} />
              Anonymous
            </button>
            <button type="submit" disabled={!text.trim()} className="rounded-full bg-green px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40">
              Send
            </button>
          </div>
        </form>
      ) : (
        <p className="rounded-3xl bg-paper px-4 py-3 text-sm text-muted">Questions are closed.</p>
      )}

      <div className="mt-3 flex gap-2 overflow-x-auto">
        {SORTS.map((item) => {
          const on = sort === item.id
          return (
            <button key={item.id} type="button" onClick={() => setSort(item.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${on ? 'bg-paper text-ink shadow-sm' : 'text-muted'}`}>
              {item.label} {counts[item.id]}
            </button>
          )
        })}
      </div>

      <div className="mt-3 space-y-3 xl:columns-2 xl:gap-3 xl:space-y-0">
        {questions.map((question) => {
          const count = voteCount(state, question.id)
          const voted = hasVoted(state, question.id, me.id)
          const author = question.authorId ? presentPerson(state, me.id, question.authorId) : null
          const byline = question.isAnonymous ? 'Anonymous' : question.authorId === me.id ? 'You' : author ? author.fullName : 'Someone'
          const comments = state.comments.filter((item) => item.questionId === question.id)
          const open = openId === question.id
          return (
            <article key={question.id} className={`flex gap-3 rounded-3xl bg-paper p-3 xl:mb-3 xl:break-inside-avoid ${question.isAnswered ? 'opacity-70' : ''}`}>
              <button
                type="button"
                aria-pressed={voted}
                aria-label={voted ? `Remove your vote. ${count} ${count === 1 ? 'vote' : 'votes'}` : `Vote for this question. ${count} ${count === 1 ? 'vote' : 'votes'}`}
                disabled={!state.event.questionsOpen || question.isAnswered}
                onClick={() => dispatch({ type: 'toggleVote', questionId: question.id })}
                className={`flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl py-2 ${voted ? 'bg-green text-ink' : 'bg-green/10 text-ink'}`}
              >
                <Icon name="up" className="h-4 w-4" />
                <span className="text-lg font-semibold leading-none">{count}</span>
                <span className="text-[10px] font-medium leading-none">{voted ? 'Voted' : 'Vote'}</span>
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium leading-snug">{question.text}</p>
                {question.topics.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {question.topics.map((topic) => (
                      <span key={topic} className="rounded-full bg-green/15 px-2 py-0.5 text-[11px] font-semibold text-ink">
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                  <span>
                    {byline}
                    {question.isAnswered ? ' · Answered' : ''}
                    {question.isHidden ? ' · Hidden' : ''}
                  </span>
                  <button type="button" onClick={() => setOpenId(open ? null : question.id)} className="font-semibold text-ink">
                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                  </button>
                </div>
                {open ? (
                  <div className="mt-3 space-y-2">
                    {comments.map((item) => {
                      const writer = presentPerson(state, me.id, item.authorId)
                      return (
                        <p key={item.id} className="rounded-2xl bg-sand px-3 py-2 text-sm leading-snug">
                          <span className="font-semibold">{writer ? firstName(writer.fullName) : 'Someone'}. </span>
                          {item.text}
                        </p>
                      )
                    })}
                    <form
                      onSubmit={(event) => {
                        event.preventDefault()
                        dispatch({ type: 'addComment', questionId: question.id, text: comment })
                        setComment('')
                      }}
                      className="flex gap-2"
                    >
                      <input
                        value={open ? comment : ''}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder="Add a comment"
                        maxLength={240}
                        className="min-w-0 flex-1 rounded-full bg-sand px-3 py-2 text-sm outline-none"
                      />
                      <button type="submit" disabled={!comment.trim()} className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-cream disabled:opacity-40">
                        Send
                      </button>
                    </form>
                  </div>
                ) : null}
                {me.isOrganizer ? (
                  <div className="mt-2 flex gap-4 text-sm font-medium text-muted">
                    <button type="button" onClick={() => dispatch({ type: 'moderate', questionId: question.id, patch: { isHidden: !question.isHidden } })}>
                      {question.isHidden ? 'Show' : 'Hide'}
                    </button>
                    <button type="button" onClick={() => dispatch({ type: 'moderate', questionId: question.id, patch: { isAnswered: !question.isAnswered } })}>
                      {question.isAnswered ? 'Reopen' : 'Answered'}
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          )
        })}
        {!questions.length ? <p className="py-8 text-center text-sm text-muted">Nothing in this list yet.</p> : null}
      </div>
    </div>
  )
}

function CommitmentWall() {
  const { state, dispatch } = useStore()
  const { me } = useMe()
  const nav = useNav()
  const mine = state.commitments.find((item) => item.participantId === me.id)
  const [draft, setDraft] = useState(mine?.text ?? '')
  const wall = state.commitments.filter((item) => item.participantId !== me.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="mt-2 space-y-4 xl:grid xl:grid-cols-[minmax(280px,22rem)_minmax(0,1fr)] xl:items-start xl:gap-10 xl:space-y-0">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Commitment wall</h2>
        <p className="mt-1 font-medium">One action to take back to my team</p>
        <div className="mt-3 rounded-[24px] bg-paper p-4 ring-1 ring-line focus-within:ring-2 focus-within:ring-green">
          <textarea
            value={draft}
            maxLength={280}
            rows={4}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="One action to take back"
            className="w-full resize-none bg-transparent text-[15px] font-medium leading-snug outline-none placeholder:text-muted/60"
          />
          <p className="mt-2 text-sm text-muted">Publish one named commitment. Profile visibility and organizer moderation apply.</p>
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => dispatch({ type: 'saveCommitment', text: draft })}
            className="mt-3 h-12 w-full rounded-full bg-ink text-[15px] font-semibold text-cream disabled:opacity-40"
          >
            Publish commitment
          </button>
        </div>
      </section>
      <section>
        {wall.length ? (
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-4 md:space-y-0">
            {wall.map((item) => {
              const view = presentPerson(state, me.id, item.participantId)
              if (!view) return null
              return (
                <button key={item.participantId} type="button" onClick={() => nav.open({ type: 'person', id: item.participantId })} className="flex w-full gap-3 text-left">
                  <Avatar person={view} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{view.fullName}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-muted">{item.text}</span>
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted">No commitments yet.</p>
        )}
      </section>
    </div>
  )
}

function FeedbackForm() {
  const { state, dispatch } = useStore()
  const { me } = useMe()
  const done = state.feedbackDone.includes(me.id)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState('')
  const [change, setChange] = useState('')

  if (!state.event.feedbackOpen) return <p className="mt-6 text-sm text-muted">Feedback is closed.</p>
  if (done) return <p className="mt-8 text-center text-lg font-semibold">Thank you. One note is enough.</p>

  return (
    <div className="mt-2 md:max-w-xl">
      <h2 className="text-lg font-semibold">Overall rating</h2>
      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} out of 5`}
            onClick={() => setScore(value)}
            className={`grid h-11 w-11 place-items-center rounded-xl text-sm font-semibold ${score === value ? 'bg-ink text-cream' : 'bg-paper text-ink'}`}
          >
            {value}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">1 — not useful · 5 — very useful</p>
      <Note label="Most useful part" value={best} onChange={setBest} placeholder="The conversation I want to remember." />
      <Note label="One thing to change" value={change} onChange={setChange} placeholder="What would help next time." />
      <p className="mt-3 text-sm text-muted">One submission per participant. Organizers can read it.</p>
      <button
        type="button"
        disabled={score === 0}
        onClick={() =>
          dispatch({
            type: 'submitFeedback',
            entry: { metScore: score, timeScore: score, takeawayScore: score, best: best.trim(), change: change.trim() },
          })
        }
        className="mt-4 h-12 w-full rounded-full bg-ink text-[15px] font-semibold text-cream disabled:opacity-40"
      >
        Submit feedback
      </button>
    </div>
  )
}

function Note({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-medium">
        {label} <span className="font-normal text-muted">(optional)</span>
      </span>
      <textarea value={value} maxLength={280} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className="mt-2 w-full resize-none rounded-2xl bg-paper px-4 py-3 text-[15px] outline-none placeholder:text-muted/60" />
    </label>
  )
}
