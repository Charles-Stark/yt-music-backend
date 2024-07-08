import express, {Request, Response} from 'express';
import {PrismaClient} from "@prisma/client";

const app = express();
const port = 2999;

const prisma = new PrismaClient()

app.get('/', (req: Request, res: Response) => {
  res.send('just a very boring thing')
})

app.get('/song', async (req: Request, res: Response) => {
  const songList = await prisma.song.findMany()
  res.json(songList)
})

app.get('/media', async (req: Request, res: Response) => {
  try {
    console.log(req.query)

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const totalRecords = await prisma.media.count();
    const totalPages = Math.ceil(totalRecords / pageSize);

    const mediaList = await prisma.media.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
