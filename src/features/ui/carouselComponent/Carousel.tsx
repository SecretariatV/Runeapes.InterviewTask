import { ICarousel } from "../../../utils/typesUtils";
import * as S from "./Carousel.styled";
import { useWindowSize } from "usehooks-ts";
import { useEffect, useRef, useState } from "react";
import { Item } from "./item";
import { appMachine } from "../../../machines/appMachine";
import { useMachine } from "@xstate/react";
import { generateRandomColors } from "../../../utils/funcUtils";
import { useDrag } from "@use-gesture/react";

const Carousel = ({
  isInfinite,
  viewCount,
  datas,
  fullWidth,
  viewWidth,
  viewHeight,
}: ICarousel) => {
  const [state, send] = useMachine(appMachine);

  const { width = 0, height = 0 } = useWindowSize();
  const [itemWidth, setItemWidth] = useState<number>(0);
  const [move, setMove] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  // const [isMobile, setIsMobile] = useState<boolean>(false);
  const [colors, setColors] = useState<string[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fullWidth) {
      setItemWidth(width / viewCount);
    } else if (viewWidth) {
      setItemWidth(viewWidth / viewCount);
    }

    if (width < 768) {
      // setIsMobile(true);
    }
  }, [width, fullWidth]);

  useEffect(() => {
    setColors(generateRandomColors(datas));
  }, [datas]);

  const handleChangeIndex = (index: number) => {
    if (isInfinite) {
      send({
        type: "SET_INDEX",
        index: (state.context.index + index + datas) % datas,
      });
    } else {
      send({
        type: "SET_INDEX",
        index:
          state.context.index + index < 0
            ? 0
            : state.context.index + index > datas - viewCount
              ? datas - viewCount
              : state.context.index + index,
      });
    }
  };

  const setIndex = (index: number) => {
    if (isInfinite) {
      send({
        type: "SET_INDEX",
        index: (state.context.index - index + datas) % datas,
      });
    } else {
      send({
        type: "SET_INDEX",
        index:
          state.context.index - index < 0
            ? 0
            : state.context.index - index > datas - viewCount
              ? datas - viewCount
              : state.context.index - index,
      });
    }
  };

  const bind = useDrag(
    ({ down, movement: [mx], velocity, direction: [xDir] }) => {
      if (!down) {
        if (Math.abs(move) > itemWidth) {
          setIndex(Math.round(move / itemWidth));
        }
        setMove(0);
        setIndex(Math.round(velocity[0]) * xDir);
        setCount(0);
      } else {
        if (Math.abs(mx) > itemWidth * (count + 1)) {
          setCount(count + 1);
          setIndex(Math.round(mx / itemWidth));
        }
        setMove(mx);
      }
    }
  );

  return (
    <S.Container
      $viewWidth={fullWidth ? width : viewWidth!}
      $viewHeight={viewHeight ? viewHeight : height}
      $isInfinite={isInfinite}
    >
      <div className="left" onClick={() => handleChangeIndex(-1)}>
        Prev
      </div>
      <div className="slider" ref={sliderRef} {...bind()}>
        {new Array(datas).fill(null).map((_, index) => (
          <Item
            key={index}
            id={index}
            $itemWidth={itemWidth}
            $isInfinite={isInfinite}
            $viewCount={viewCount}
            $totalCount={datas}
            movePosition={move}
            $index={state.context.index}
            $backgroundColor={colors[index]}
          />
        ))}
      </div>
      <div className="right" onClick={() => handleChangeIndex(1)}>
        Next
      </div>
    </S.Container>
  );
};

export default Carousel;
