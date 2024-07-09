import express, {Request, Response} from 'express';
import {Prisma, PrismaClient} from "@prisma/client";

const app = express();
const port = 2999;

const prisma = new PrismaClient()

app.get('/', (req: Request, res: Response) => {
  res.send('just a very boring thing')
})

app.get('/song', async (req: Request, res: Response) => {
  const songList = await prisma.song.findMany({
    orderBy: {
      id: 'asc',
    }
  })
  res.json(songList)
})

app.get('/randomSongs', async (req: Request, res: Response) => {
  const count = parseInt(req.query.count as string) || 5;
  const songs = await prisma.$queryRaw(
    Prisma.sql`SELECT * FROM "Song" ORDER BY RANDOM() LIMIT ${count};`
  )
  res.json(songs)
})

app.get('/media', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const totalRecords = await prisma.media.count();
    const totalPages = Math.ceil(totalRecords / pageSize);

    const mediaList = await prisma.media.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        id: 'asc',
      }
    });

    res.json({
      mediaList,
      totalPages,
      totalRecords,
      currentPage: page,
      pageSize,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.get('/search', async (req: Request, res: Response) => {
  const keyword = req.query.keyword as string;
  if (keyword === '') {
    res.json([])
  }

  const songs = await prisma.song.findMany({
    where: {
      OR: [
        {name: {contains: keyword, mode: 'insensitive'}},
        {creator: {contains: keyword, mode: 'insensitive'}},
      ]
    }
  })
  res.json(songs)
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
