## Data Science Experience (DSX)
---

Repository hosting change log entries for use in the What's New page within Data Science Experience (DSX).

### (1) Local Setup
---

#### (1.1) Clone Source

```shell
git clone git@github.com:IBMDataScience/datascix.git
```

#### (1.2) Directory Location

```shell
cd datascix
```

#### (1.3) Install Dependencies

```shell
npm install
```

#### (1.4) Validate JSON

```shell
grunt
```

### (2) Change Log / Environment Mappings
---


| DSX Environment | Change Log Path | DSX URL |
| --- | --- | --- |
| YS1 DEV | [public/dev/changelog/entries.json](https://github.com/IBMDataScience/datascix/blob/master/public/dev/changelog/entries.json) | https://apsx-dev.stage1.ng.bluemix.net/whats-new?context=analytics |
| YP QA | [public/qa/changelog/entries.json](https://github.com/IBMDataScience/datascix/blob/master/public/qa/changelog/entries.json) | https://apsx-qa.ng.bluemix.net/whats-new?context=analytics |
| YP PROD | [public/prod/changelog/entries.json](https://github.com/IBMDataScience/datascix/blob/master/public/prod/changelog/entries.json) | https://apsportal.ibm.com/whats-new?context=analytics |
