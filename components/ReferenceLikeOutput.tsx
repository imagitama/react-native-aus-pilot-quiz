import { ReferenceLike } from "@/types";
import { ExternalLink } from "./ExternalLink";

const ReferenceLikeOutput = ({
  referenceLike,
}: {
  referenceLike: ReferenceLike;
}) => {
  if (typeof referenceLike === "string") {
    return referenceLike;
  }

  if (Array.isArray(referenceLike)) {
    return referenceLike.map((item, idx) => (
      <ReferenceLikeOutput key={idx} referenceLike={item} />
    ));
  }

  if (referenceLike.url) {
    return (
      // @ts-ignore
      <ExternalLink href={referenceLike.url}>{referenceLike.url}</ExternalLink>
    );
  }

  return null;
};

export default ReferenceLikeOutput;
