import { useState } from 'react'
import { agendaPhases, clockMinutes, firstName, hasVoted, presentPerson, voteCount } from '@/lib/logic'
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
        <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight">Participate</h1>
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
      <QaHeader asked={visible.length} />
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
            <button type="submit" disabled={!text.trim()} className="inline-flex items-center gap-1.5 rounded-full bg-green px-4 py-2 text-sm font-bold text-on disabled:opacity-40">
              <Icon name="send" className="h-4 w-4" />
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
            <button key={item.id} type="button" onClick={() => setSort(item.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${on ? 'bg-ink text-cream' : 'text-muted'}`}>
              {item.label} <span className="tabular-nums opacity-70">{counts[item.id]}</span>
            </button>
          )
        })}
      </div>

      <div className="stagger mt-3 space-y-3 xl:columns-2 xl:gap-3 xl:space-y-0">
        {questions.map((question, index) => {
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
                <span key={count} className="pop text-lg font-extrabold leading-none tabular-nums">{count}</span>
                <span className="text-[10px] font-medium leading-none">{voted ? 'Voted' : 'Vote'}</span>
              </button>
              <div className="min-w-0 flex-1">
                {sort === 'top' && index < 3 && count > 0 ? (
                  <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-ink">
                    <Icon name="trophy" className="h-3 w-3" />#{index + 1} most voted
                  </span>
                ) : null}
                <p className="text-[15px] font-semibold leading-snug">{question.text}</p>
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
                  <span className="inline-flex items-center gap-1.5">
                    {author && !question.isAnonymous ? <Avatar person={author} size={20} className="align-top" /> : null}
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

function QaHeader({ asked }: { asked: number }) {
  const { state } = useStore()
  const { me } = useMe()
  const session = state.event.agenda.find((item) => item.kind === 'qa')
  const phase = session ? agendaPhases(state.event.agenda, clockMinutes(state.event)).get(session.id) : null
  const votes = state.votes.length
  const yours = state.votes.filter((vote) => vote.voterId === me.id).length

  return (
    <section className="hero-panel mb-3 rounded-[26px] p-5">
      <p className="eyebrow flex items-center gap-2 text-green">
        {phase === 'now' ? <span className="live-dot" /> : null}
        {phase === 'now' ? 'Live now' : phase === 'past' ? 'Answered earlier today' : session ? `Today at ${session.time}` : 'Q&A'}
      </p>
      <h2 className="mt-2 text-[1.45rem] font-extrabold leading-tight tracking-tight">{session?.title ?? 'Questions for the leaders'}</h2>
      <p className="mt-1 text-sm text-white/65">The most-voted questions are answered first.</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Questions', value: asked },
          { label: 'Votes', value: votes },
          { label: 'Your votes', value: yours },
        ].map((stat) => (
          <span key={stat.label} className="rounded-2xl bg-white/[0.07] px-3 py-2.5 ring-1 ring-white/10">
            <span className="block text-2xl font-extrabold leading-none tabular-nums">{stat.value}</span>
            <span className="mt-1 block text-[11px] font-medium text-white/60">{stat.label}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

function CommitmentWall() {
  const { state, dispatch } = useStore()
  const { me, view: self } = useMe()
  const nav = useNav()
  const mine = state.commitments.find((item) => item.participantId === me.id)
  const [draft, setDraft] = useState(mine?.text ?? '')
  const [editing, setEditing] = useState(!mine)
  const wall = state.commitments.filter((item) => item.participantId !== me.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="mt-2 space-y-5 xl:grid xl:grid-cols-[minmax(280px,22rem)_minmax(0,1fr)] xl:items-start xl:gap-10 xl:space-y-0">
      <section>
        <h2 className="text-2xl font-extrabold tracking-tight">Commitment wall</h2>
        <p className="mt-0.5 text-sm text-muted">One action each of us takes back to our team.</p>
        {mine && !editing ? (
          <div className="challenge-panel mt-3 rounded-[26px] p-5">
            <p className="eyebrow flex items-center gap-1.5 text-green">
              <Icon name="check" className="h-3.5 w-3.5" />
              Your commitment
            </p>
            <p className="mt-2 text-lg font-bold leading-snug">“{mine.text}”</p>
            <div className="mt-4 flex items-center gap-2">
              {self ? <Avatar person={self} size={28} className="align-top ring-2 ring-white/20" /> : null}
              <span className="mr-auto text-xs text-white/65">On the wall for everyone</span>
              <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15">
                <Icon name="edit" className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-[24px] bg-paper p-4 ring-2 ring-green">
            <p className="eyebrow flex items-center gap-1.5 text-green">
              <Icon name="leaf" className="h-3.5 w-3.5" />
              {mine ? 'Edit your commitment' : 'Add yours'}
            </p>
            <textarea
              value={draft}
              maxLength={280}
              rows={3}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="One action to take back to your team"
              className="mt-2 w-full resize-none bg-transparent text-[15px] font-medium leading-snug outline-none placeholder:text-muted/60"
            />
            <p className="text-xs text-muted">Shown with your name. Organizers can moderate the wall.</p>
            <div className="mt-3 flex gap-2">
              {mine ? (
                <button type="button" onClick={() => { setDraft(mine.text); setEditing(false) }} className="h-12 rounded-full bg-sand px-5 text-[15px] font-semibold">
                  Cancel
                </button>
              ) : null}
              <button
                type="button"
                disabled={!draft.trim()}
                onClick={() => {
                  dispatch({ type: 'saveCommitment', text: draft })
                  setEditing(false)
                }}
                className="h-12 flex-1 rounded-full bg-green text-[15px] font-bold text-on disabled:opacity-40"
              >
                {mine ? 'Save' : 'Publish commitment'}
              </button>
            </div>
          </div>
        )}
      </section>
      <section>
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h3 className="font-bold">From the room</h3>
          <span className="text-xs font-medium text-muted tabular-nums">{wall.length} commitments</span>
        </div>
        {wall.length ? (
          <div className="stagger columns-2 gap-3 md:columns-3">
            {wall.map((item, index) => {
              const view = presentPerson(state, me.id, item.participantId)
              if (!view) return null
              return (
                <button
                  key={item.participantId}
                  type="button"
                  onClick={() => nav.open({ type: 'person', id: item.participantId })}
                  className="mb-3 block w-full break-inside-avoid rounded-[20px] bg-paper p-3.5 text-left"
                >
                  <span className="block font-serif text-3xl leading-none text-green" aria-hidden>
                    “
                  </span>
                  <span className={`block font-semibold leading-snug ${index % 3 === 0 ? 'text-[15px]' : 'text-sm'}`}>{item.text}</span>
                  <span className="mt-3 flex items-center gap-2">
                    <Avatar person={view} size={26} className="align-top" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold">{firstName(view.fullName)}</span>
                      <span className="block truncate text-[11px] text-muted">{view.department}</span>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted">No commitments yet. Be the first.</p>
        )}
      </section>
    </div>
  )
}

const RATINGS = ['Tap a star to rate', 'Not useful', 'Somewhat useful', 'Useful', 'Very useful', 'Outstanding']

function FeedbackForm() {
  const { state, dispatch } = useStore()
  const { me } = useMe()
  const done = state.feedbackDone.includes(me.id)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState('')
  const [change, setChange] = useState('')

  if (!state.event.feedbackOpen) return <p className="mt-6 text-sm text-muted">Feedback is closed.</p>
  if (done) {
    return (
      <div className="challenge-panel rise mt-2 rounded-[26px] p-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green text-on">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <p className="mt-4 text-xl font-extrabold tracking-tight">Thank you.</p>
        <p className="mt-1 text-sm text-white/70">Your note goes straight to the organizers. One is enough.</p>
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-3 md:max-w-xl">
      <section className="rounded-[26px] bg-paper p-5 text-center">
        <p className="eyebrow text-muted">Rate the day</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight">How useful was today?</h2>
        <div className="mt-4 flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => {
            const on = value <= score
            return (
              <button
                key={value}
                type="button"
                aria-label={`${value} out of 5`}
                aria-pressed={score === value}
                onClick={() => setScore(value)}
                className={`grid h-12 w-12 place-items-center rounded-2xl transition-colors ${on ? 'bg-green/15 text-green' : 'bg-sand text-muted'}`}
              >
                <Icon name="star" filled={on} className={`h-7 w-7 ${on ? 'pop' : ''}`} />
              </button>
            )
          })}
        </div>
        <p className={`mt-3 text-sm font-semibold ${score ? 'text-green' : 'text-muted'}`}>{RATINGS[score]}</p>
      </section>
      <section className="space-y-4 rounded-[26px] bg-paper p-5">
        <Note label="Most useful part" value={best} onChange={setBest} placeholder="The conversation I want to remember." />
        <Note label="One thing to change" value={change} onChange={setChange} placeholder="What would help next time." />
      </section>
      <p className="px-1 text-xs text-muted">One submission per participant. It is not linked to your name.</p>
      <button
        type="button"
        disabled={score === 0}
        onClick={() =>
          dispatch({
            type: 'submitFeedback',
            entry: { metScore: score, timeScore: score, takeawayScore: score, best: best.trim(), change: change.trim() },
          })
        }
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-green text-[15px] font-bold text-on disabled:bg-sand disabled:text-muted"
      >
        <Icon name="send" className="h-4 w-4" />
        Submit feedback
      </button>
    </div>
  )
}

function Note({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">
        {label} <span className="font-normal text-muted">(optional)</span>
      </span>
      <textarea value={value} maxLength={280} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className="mt-2 w-full resize-none rounded-2xl bg-sand/60 px-4 py-3 text-[15px] outline-none ring-green/40 placeholder:text-muted/60 focus:ring-2" />
    </label>
  )
}
