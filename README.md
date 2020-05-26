# dazaar-search-ctl

CLI to administrate with a Dazaar search index

```
npm install -g dazaar-search-ctl
```

## Usage

``` sh
# setup
dazaar-search-ctl init (--replicate=other-search-index)

# add entry (card needs to set a "keywords" array)
dazaar-search-ctl add --card dazaar-card.json

# remove entry
dazaar-search-ctl remove --card dazaar-card.json

# start replicating
dazaar-search-ctl replicate
```

## License

MIT
