# Update DB

UpdateDB is a tool I made, to support the creation of my personal website. It allows me to automatically update a Redis Database, that manages Hashes for the websites locale support.

## Usage

The tools core functionality is delivered as a CLI.

### Basic usage

```
$ update-db
New DB entries can be created for:
    - en:index
    - fr:index

Should the listed entries be created [Y/n]? y
Successfully created en:index@DB0
Successfully created fr:index@DB0
```

The tool automatically detects the available languages by checking the database for existing locale hashes and subsequently asking to create missing ones.

### Ignoring Hashes
Specific hashes can be ignored, by adding a ```$``` before the name of the site, e.g. ```de:index``` will not be ignored, but ```de:$index``` **will** be ignored.