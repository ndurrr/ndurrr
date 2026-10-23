# The Nest launcher

The Nest's home on your phone. It opens instantly, shows Hilal's one quest for today and the next prayer, then one tap takes you into the Nest.

- `index.html`: the home-screen app (Share, then Add to Home Screen). Works offline through `sw.js`.
- `today.json`: Hilal's quest for the day. A morning routine rewrites it after the Hilal note goes out.
- `widget.js`: the Scriptable widget (home screen and lock screen). `widget/` is the setup page and `widget/nest.js` the one-time loader.

Live at https://ndurrr.github.io/ndurrr/nest/
