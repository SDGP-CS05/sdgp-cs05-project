# Contributing

These rules apply to every team member. The `protect-main` ruleset on `main` enforces the pull request and review rules. We follow the rest ourselves.

## Branches
- Never push to `main`. It always holds work the team has reviewed, and the ruleset blocks direct pushes.
- One branch per Jira story: `type/SDGP-<n>-short-name`, for example `feature/SDGP-12-login`, `fix/SDGP-15-typo`, `docs/SDGP-20-ch2`. The Jira key is mandatory.
- Keep branches short-lived (days, not weeks). Pull the latest `main` often.
- Delete the branch after merging.

## Commits
- Small, frequent commits. Start the message with the Jira key, in the present tense: `SDGP-12 add login form validation`.
- Commit locally as often as you like, and push at least at the end of every work session.
- Each person commits their own work under their own account.
- Never commit passwords, keys, tokens, personal data or client details.

## Pull requests
- Start the PR title with the Jira key: `SDGP-12 Add login screen`. This links the PR to its story on the board.
- Fill in the PR template.
- Keep PRs small. If it is more than about a day of work, split it.
- At least one approval from someone other than the author before merging.
- The reviewer replies within 24 hours. The author answers every comment before merging.
- Merge by the author, after approval, using **Squash and merge** only (the other merge methods are disabled). Keep the squash commit title as the PR title.
- Delete the branch after merging.
- Do not push more commits after approval unless needed. New commits reset the approval, so tell the reviewer.

## Reviewing
- Check: does it do what the story says, does it meet the acceptance criteria, is it readable, is anything missing?
- Be specific and kind. Say what to change and why.

## Definition of Done (ours to refine at retro)
- Meets the story's acceptance criteria.
- Reviewed and approved by a teammate.
- Merged to `main` by squash merge, Jira story moved to Done.
- Documentation or the Google Doc updated if it changed.

## Code quality
- Coding standards: [to be agreed once the technology is confirmed].
- Add or update test cases for each user story (see the test strategy in 7.7).

## Using AI tools
- Allowed only as the module permits. You must understand and be able to explain every line you commit.
- Do not paste secrets or client data into an AI tool.

## Team rules
- Daily stand-up, or a written update if you miss it.
- Raise blockers within 24 hours.
- Write your portfolio sections in the shared Google Doc under your own account.
- Keep your own logbook up to date.
