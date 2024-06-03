'use client';

import { useTypewriter, Cursor } from 'react-simple-typewriter'

const Title = () => {
    const [text] = useTypewriter({
        words: ['ваш интеллектуальный проводник в мире информации.', 
                'искусственный интеллект для мгновенного поиска.', 
                'точный и быстрый поиск информации для разработчиков.', 
                'ваш надежный источник точной информации.'],
        loop: false,
      })
    
      return (
        <div>
          <span className="text-[14px]">Estento AI - {text}</span>
          <Cursor/>
        </div>
      )
};

export default Title;