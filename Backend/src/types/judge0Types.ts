export type Judge0BatchItem = {
  token: string;
};

export type Judge0BatchResponse = Judge0BatchItem[];

export type Judge0SubmissionResult = {
  token: string;
  stdout: string | null;
  stderr: string | null;
  status: {
    id: Judge0StatusId;
    description: string;
  };
};

export type Judge0PollResponse = {
  submissions: Judge0SubmissionResult[];
};
export type Judge0StatusId = 1 | 2 | 3 | 4 | 5 | 6;
