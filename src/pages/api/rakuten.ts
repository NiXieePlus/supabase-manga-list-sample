import moji from "moji";
import type { NextApiRequest, NextApiResponse } from "next";

const compare = (a: bookData, b: bookData) => {
  if (a.title < b.title) {
    return -1;
  } else {
    return 1;
  }
};

type rakutenItem = {
  Item: bookItem;
};

type bookItem = {
  title: string;
  author: string;
  publisherName: string;
  largeImageUrl: string;
  isbn: string;
};

export type bookData = {
  title: string;
  author: string;
  publisherName: string;
  imageUrl: string;
  isbn: string;
};

const convertToUtf8 = (text: string) => {
  return unescape(encodeURIComponent(text));
};

const extractData = (item: rakutenItem) => {
  let titleString = item.Item.title;
  titleString = moji(titleString).convert("ZE", "HE").toString();
  titleString = moji(titleString).convert("ZS", "HS").toString();
  let authorString = item.Item.author;
  authorString = moji(authorString).convert("ZE", "HE").toString();
  authorString = moji(authorString).convert("ZS", "HS").reject("HS").toString();
  const data: bookData = {
    title: titleString,
    author: authorString,
    publisherName: item.Item.publisherName,
    imageUrl: item.Item.largeImageUrl,
    isbn: item.Item.isbn,
  };
  return data;
};

const Rakuten = async (req: NextApiRequest, res: NextApiResponse) => {
  let url =
    "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=" +
    process.env.RAKUTEN_APP_ID +
    "&booksGenreId=001001";

  let { title } = req.query;
  if (title) {
    title = title.toString();
    url += "&title=" + convertToUtf8(title);
  }

  let { author } = req.query;
  if (author) {
    author = author.toString();
    url += "&author=" + convertToUtf8(author);
  }

  if (title || author) {
    let bookList: bookData[] = [];
    let count = -1;
    const response = await fetch(url);
    const data = await response.json();
    if (data) {
      data.Items.map((item: rakutenItem) => {
        bookList = [...bookList, extractData(item)];
      });
      count = data.count;

      for (let i = 1; i < data.pageCount; i++) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const response = await fetch(url + "&page=" + (i + 1));
        const data = await response.json();
        if (data) {
          data.Items.map((item: rakutenItem) => {
            bookList = [...bookList, extractData(item)];
          });
        }
      }
    }

    if (count != bookList.length) {
      res.status(500).json({ massege: "Error: Rakuten Book API." });
    } else {
      bookList.sort(compare);
      res.status(200).json({ data: bookList, size: count });
    }
  } else {
    res
      .status(500)
      .json({ massege: "Error: Please set title or author to query." });
  }
};

export default Rakuten;
